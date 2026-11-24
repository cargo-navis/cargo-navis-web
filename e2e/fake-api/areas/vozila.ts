import type { Vehicle } from '@/lib/api/vehicles.d';

import { day } from '../../support/time';
import { noContent, notFound, ok, route } from '../http';
import { newId, uuid } from '../ids';

/** Flota. */
export const VOZILO = {
  tegljac1: uuid(401),
  tegljac2: uuid(402),
  prikolica1: uuid(411),
};

function vehicle(id: string, type: Vehicle['type'], registration: string, brand: string): Vehicle {
  return {
    id,
    type,
    registration,
    brand,
    emissionStandard: 'EURO6',
    enginePower: type === 'TRAILER' ? 0 : 480,
    tankSize: type === 'TRAILER' ? 0 : 700,
    averageFuelConsumption: type === 'TRAILER' ? 0 : 29,
    tachographExpiryDate: day(400),
    fireExtinguisherCheckExpiryDate: day(250),
    technicalInspectionExpiryDate: day(180),
    adrExpiryDate: day(365),
    dimensions: { id: `${id}-dim`, width: 2.48, height: 4, length: 13.6 },
    loadCapacity: 24_000,
    vehicleLoadType: 'tilt_truck' as Vehicle['vehicleLoadType'],
    equipment: [],
    ramp: false,
    codeXlCertificateExpiryDate: day(365),
    manufacturingYear: 2021,
    numberOfAxles: type === 'TRAILER' ? 3 : 2,
    registrationDate: day(-365),
    registrationExpiryDate: day(120),
    emptyWeight: 7_500,
    vehicleIdentificationNumber: `WDB${id.slice(-6)}00000000`,
    documents: [],
  };
}

export function seedVozila(): Vehicle[] {
  return [
    vehicle(VOZILO.tegljac1, 'TRUCK' as Vehicle['type'], 'ZG-1234-AB', 'Mercedes-Benz Actros'),
    vehicle(VOZILO.tegljac2, 'TRUCK' as Vehicle['type'], 'ZG-5678-CD', 'Volvo FH'),
    vehicle(VOZILO.prikolica1, 'TRAILER' as Vehicle['type'], 'ZG-900-PP', 'Krone Profi Liner'),
  ];
}

export const vozilaRoutes = [
  route('GET', '/api/fleet', (_, db) => ok(db.vozila)),
  route('GET', '/api/fleet/:id', ({ params }, db) => {
    const found = db.vozila.find((entry) => entry.id === params.id);
    return found ? ok(found) : notFound('Vehicle');
  }),
  route('POST', '/api/fleet', ({ body }, db) => {
    const created = { id: newId(), documents: [], ...body } as Vehicle;
    db.vozila.push(created);
    return ok(created, 201);
  }),
  route('PATCH', '/api/fleet/:id', ({ params, body }, db) => {
    const found = db.vozila.find((entry) => entry.id === params.id);
    if (!found) return notFound('Vehicle');
    Object.assign(found, body);
    return ok(found);
  }),
  route('DELETE', '/api/fleet/:id', ({ params }, db) => {
    const index = db.vozila.findIndex((entry) => entry.id === params.id);
    if (index < 0) return notFound('Vehicle');
    db.vozila.splice(index, 1);
    return noContent();
  }),
];
