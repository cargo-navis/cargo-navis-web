import type { Tenant } from '@/lib/api/tenant.d';

import { day, serverNow } from '../../support/time';
import { formField, noContent, ok, route } from '../http';
import { newId, uuid } from '../ids';
import { POSTAL_CODES, postalCode } from './ostalo';

export function seedTvrtka(): Tenant & { logoUploads: number } {
  return {
    logoUploads: 0,
    id: uuid(901),
    name: 'Navis Transport d.o.o.',
    taxId: '12345678903',
    communityLicenseId: 'HR-2024-00123',
    cargoInsuranceExpiryDate: day(200),
    shipmentFooter: 'Navis Transport d.o.o. · Zagreb',
    shipmentTransportTerms: 'Prijevoz prema CMR konvenciji.',
    address: {
      // The company form looks the postal code up by this id (GET /api/postalCodes/{address.id}), so it is Zagreb's.
      id: postalCode('10000').id,
      streetName: 'Radnička cesta 1',
      postalCode: '10000',
      placeName: 'Zagreb',
      countryCode: 'HR',
    },
  };
}

export const tvrtkaRoutes = [
  route('GET', '/api/tenant', (_, db) => ok(tenant(db.tvrtka))),
  route('PUT', '/api/tenant', ({ body }, db) => {
    const { address, ...rest } = body ?? {};
    Object.assign(db.tvrtka, rest);
    if (address?.streetName) db.tvrtka.address.streetName = address.streetName;
    const code = POSTAL_CODES.find((item) => item.id === address?.postalCodeId);
    if (code)
      Object.assign(db.tvrtka.address, {
        id: code.id,
        postalCode: code.postalCode,
        placeName: code.placeName,
        countryCode: code.countryCode,
      });
    return ok(tenant(db.tvrtka));
  }),
  // Each upload gets a new public URL, like the backend's (the app adds no cache-busting of its own). It points at a
  // real image of the app (public/logomark.png), so the <img> loads.
  route('POST', '/api/tenant/logo', (request, db) => {
    db.tvrtka.logoUploads += 1;
    const name = formField(request, 'fileName') ?? formField(request, 'file') ?? 'logo.png';
    db.tvrtka.logo = {
      id: newId(),
      createdAt: serverNow(),
      name,
      mimeType: 'image/png',
      status: 'UPLOADED',
      publicUrl: `/logomark.png?upload=${db.tvrtka.logoUploads}`,
    };
    return ok(tenant(db.tvrtka));
  }),
  route('DELETE', '/api/tenant/logo', (_, db) => {
    delete db.tvrtka.logo;
    return noContent();
  }),
];

/** The tenant as the API returns it (without the test's bookkeeping). */
function tenant({ logoUploads: _logoUploads, ...rest }: ReturnType<typeof seedTvrtka>): Tenant {
  return rest;
}
