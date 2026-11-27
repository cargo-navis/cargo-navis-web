import type { Client } from '@/lib/api/clients.d';
import type { Contractor } from '@/lib/api/contractors.d';

import { noContent, notFound, ok, route } from '../http';
import { newId, uuid } from '../ids';
import { POSTAL_CODES, postalCode } from './ostalo';

/** Klijenti (clients) and podvozari (transport contractors). */
export const KLIJENT = {
  podravka: uuid(101),
  atlantic: uuid(102),
  kras: uuid(103),
};

export const PODVOZAR = {
  brzica: uuid(201),
};

const address = (streetName: string, code: string) => {
  const { id, ...rest } = postalCode(code);
  return { streetName, postalCodeId: id, ...rest };
};

export function seedPartneri() {
  const clients: Client[] = [
    {
      id: KLIJENT.podravka,
      name: 'Podravka d.d.',
      address: address('Ante Starčevića 32', '48000'),
      taxId: '18928523252',
      termsOfPayment: '60',
      notificationEmails: [{ email: 'logistika@podravka.test', alwaysNotify: true }],
    },
    {
      id: KLIJENT.atlantic,
      name: 'Atlantic Grupa d.d.',
      address: address('Miramarska 23', '10000'),
      taxId: '71149912416',
      termsOfPayment: '30',
      notificationEmails: [],
    },
    {
      id: KLIJENT.kras,
      name: 'Kraš d.d.',
      address: address('Ravnice 48', '10000'),
      taxId: '94989605030',
      termsOfPayment: '45',
      notificationEmails: [],
    },
  ];
  const contractors: Contractor[] = [
    {
      id: PODVOZAR.brzica,
      name: 'Brzica prijevoz d.o.o.',
      address: address('Industrijska 5', '31000'),
      taxId: '55512345678',
      termsOfPayment: '30',
      email: 'dispo@brzica.test',
    },
  ];
  return { clients, contractors };
}

/** Create/update bodies send `addressName` + `addressPostalCodeId`; the API answers with a resolved address. */
function fromParams<T extends Client | Contractor>(current: Partial<T>, body: any): T {
  const { addressName, addressPostalCodeId, termsOfPayment, ...rest } = body ?? {};
  const next: any = { ...current, ...rest };
  if (termsOfPayment !== undefined) next.termsOfPayment = String(termsOfPayment);
  if (addressPostalCodeId || addressName) {
    const code = addressPostalCodeId ? postalCodeById(addressPostalCodeId) : undefined;
    next.address = {
      ...(current.address ?? {}),
      ...(code ?? {}),
      ...(addressPostalCodeId ? { postalCodeId: addressPostalCodeId } : {}),
      ...(addressName ? { streetName: addressName } : {}),
    };
  }
  return next;
}

function postalCodeById(id: string) {
  const found = POSTAL_CODES.find((item) => item.id === id);
  if (!found) return undefined;
  const { postalCode, placeName, countryCode } = found;
  return { postalCode, placeName, countryCode };
}

function crud<T extends Client | Contractor>(base: string, list: (db: any) => T[], what: string) {
  return [
    route('GET', base, (_, db) => ok(list(db))),
    route('GET', `${base}/:id`, ({ params }, db) => {
      const item = list(db).find((entry) => entry.id === params.id);
      return item ? ok(item) : notFound(what);
    }),
    route('POST', base, ({ body }, db) => {
      const item = fromParams<T>({ id: newId(), notificationEmails: [] } as unknown as Partial<T>, body);
      list(db).push(item);
      return ok(item, 201);
    }),
    route('PUT', `${base}/:id`, ({ params, body }, db) => {
      const items = list(db);
      const index = items.findIndex((entry) => entry.id === params.id);
      if (index < 0) return notFound(what);
      items[index] = fromParams<T>(items[index], body);
      return ok(items[index]);
    }),
    route('DELETE', `${base}/:id`, ({ params }, db) => {
      const items = list(db);
      const index = items.findIndex((entry) => entry.id === params.id);
      if (index < 0) return notFound(what);
      items.splice(index, 1);
      return noContent();
    }),
  ];
}

export const partneriRoutes = [
  ...crud<Client>('/api/clients', (db) => db.partneri.clients, 'Client'),
  ...crud<Contractor>('/api/transport-contractors', (db) => db.partneri.contractors, 'Contractor'),
];

/**
 * The fake VIES register (GET /api/vies/lookup): a Croatian company with full data, and a German one whose member
 * state confirms the number but withholds the details (like the real VIES). Anything else is not found.
 */
export const VIES = {
  ledo: { countryCode: 'HR', number: '01746086877', name: 'Ledo plus d.o.o.', street: 'Čavićeva 1a', postal: '10000' },
  german: { countryCode: 'DE', number: '811569869' },
};

export const viesRoutes = [
  route('GET', '/api/vies/lookup', ({ query }) => {
    const countryCode = query.get('countryCode');
    const number = query.get('number');
    if (countryCode === VIES.ledo.countryCode && number === VIES.ledo.number) {
      const code = postalCode(VIES.ledo.postal);
      return ok({
        taxId: `${countryCode}${number}`,
        name: VIES.ledo.name,
        address: {
          countryCode: code.countryCode,
          placeName: code.placeName,
          postalCode: code.postalCode,
          postalCodeId: code.id,
          raw: `${VIES.ledo.street}, ${code.postalCode} ${code.placeName}`,
          streetName: VIES.ledo.street,
        },
      });
    }
    if (countryCode === VIES.german.countryCode && number === VIES.german.number) {
      return ok({ taxId: `${countryCode}${number}`, name: null, address: null });
    }
    return notFound('VIES company');
  }),
];
