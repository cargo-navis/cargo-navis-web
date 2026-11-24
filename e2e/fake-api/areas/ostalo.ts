import type { Alert } from '@/lib/api/alerts.d';
import type { Notification } from '@/lib/api/notifications.d';
import type { PostalCode } from '@/lib/api/postalCodes.d';
import type { ShipmentDraft } from '@/lib/api/shipment-drafts.d';

import { noContent, notFound, ok, route } from '../http';
import { uuid } from '../ids';

/** Poštanski brojevi the address pickers can find (search by number or place name). */
export const POSTAL_CODES: PostalCode[] = [
  { id: uuid(801), postalCode: '10000', placeName: 'Zagreb', countryCode: 'HR' },
  { id: uuid(802), postalCode: '21000', placeName: 'Split', countryCode: 'HR' },
  { id: uuid(803), postalCode: '31000', placeName: 'Osijek', countryCode: 'HR' },
  { id: uuid(804), postalCode: '51000', placeName: 'Rijeka', countryCode: 'HR' },
  { id: uuid(805), postalCode: '48000', placeName: 'Koprivnica', countryCode: 'HR' },
  { id: uuid(806), postalCode: '1000', placeName: 'Ljubljana', countryCode: 'SI' },
  { id: uuid(807), postalCode: '80331', placeName: 'München', countryCode: 'DE' },
];

export const postalCode = (code: string) => {
  const found = POSTAL_CODES.find((item) => item.postalCode === code);
  if (!found) throw new Error(`E2E data: unknown postal code ${code}`);
  return found;
};

export function seedOstalo() {
  return {
    alerts: [] as Alert[],
    notifications: [] as Notification[],
    pushSubscriptions: [] as unknown[],
    /** Nalozi from PDF, waiting to be confirmed. */
    drafts: [] as ShipmentDraft[],
  };
}

export const ostaloRoutes = [
  route('GET', '/api/alerts', (_, db) => ok(db.ostalo.alerts)),
  route('GET', '/api/notifications', (_, db) => ok(db.ostalo.notifications)),
  route('POST', '/api/notifications/read-all', (_, db) => {
    db.ostalo.notifications.forEach((item) => (item.isRead = true));
    return noContent();
  }),
  route('POST', '/api/notifications/:id/read', ({ params }, db) => {
    const item = db.ostalo.notifications.find((notification) => notification.id === params.id);
    if (item) item.isRead = true;
    return noContent();
  }),
  route('GET', '/api/push-subscriptions', (_, db) => ok(db.ostalo.pushSubscriptions)),
  route('POST', '/api/push-subscriptions', ({ body }, db) => {
    db.ostalo.pushSubscriptions.push(body);
    return ok(body, 201);
  }),
  route('GET', '/api/postalCodes', ({ query }) => {
    const text = (query.get('query') ?? '').toLowerCase();
    const country = query.get('country');
    return ok(
      POSTAL_CODES.filter(
        (item) =>
          (!country || item.countryCode === country) &&
          (item.postalCode.startsWith(text) || item.placeName.toLowerCase().includes(text))
      )
    );
  }),
  route('GET', '/api/postalCodes/:code', ({ params }) => {
    const found = POSTAL_CODES.find((item) => item.postalCode === params.code || item.id === params.code);
    return found ? ok(found) : notFound('Postal code');
  }),
];
