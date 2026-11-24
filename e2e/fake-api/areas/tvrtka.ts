import type { Tenant } from '@/lib/api/tenant.d';

import { day } from '../../support/time';
import { noContent, ok, route } from '../http';
import { uuid } from '../ids';

export function seedTvrtka(): Tenant {
  return {
    id: uuid(901),
    name: 'Navis Transport d.o.o.',
    taxId: '12345678903',
    communityLicenseId: 'HR-2024-00123',
    cargoInsuranceExpiryDate: day(200),
    shipmentFooter: 'Navis Transport d.o.o. · Zagreb',
    shipmentTransportTerms: 'Prijevoz prema CMR konvenciji.',
    address: {
      id: uuid(902),
      streetName: 'Radnička cesta 1',
      postalCode: '10000',
      placeName: 'Zagreb',
      countryCode: 'HR',
    },
  };
}

export const tvrtkaRoutes = [
  route('GET', '/api/tenant', (_, db) => ok(db.tvrtka)),
  route('PUT', '/api/tenant', ({ body }, db) => {
    const { address, ...rest } = body ?? {};
    Object.assign(db.tvrtka, rest);
    if (address?.streetName) db.tvrtka.address.streetName = address.streetName;
    return ok(db.tvrtka);
  }),
  route('DELETE', '/api/tenant/logo', (_, db) => {
    delete db.tvrtka.logo;
    return noContent();
  }),
];
