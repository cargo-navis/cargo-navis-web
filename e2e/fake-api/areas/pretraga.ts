import type { GlobalSearchResults, SearchResultPage } from '@/lib/api/search.d';

import type { Db } from '../db';
import { ok, route } from '../http';

/**
 * ⌘K global search (GET /api/search): case-insensitive "contains" over the same fields the backend searches, from this
 * test's data. `matchedValue` is the whole value of the first field that matched, like the backend.
 */
const TYPES = ['SHIPMENTS', 'FLEET', 'EMPLOYEES', 'CLIENTS', 'CONTRACTORS'] as const;

function firstMatch(query: string, values: (string | null | undefined)[]): string | undefined {
  return values.find((value) => !!value && value.toLowerCase().includes(query)) ?? undefined;
}

function page<T>(items: T[], limit: number): SearchResultPage<T> {
  return { items: items.slice(0, limit), total: items.length };
}

function search(db: Db, query: string, limit: number, types: Set<string>): GlobalSearchResults {
  const clientName = (id?: string) => db.partneri.clients.find((client) => client.id === id)?.name ?? null;
  const contractorName = (id?: string) =>
    db.partneri.contractors.find((contractor) => contractor.id === id)?.name ?? null;

  const shipments = types.has('SHIPMENTS')
    ? db.nalozi.flatMap((shipment) => {
        const matchedValue = firstMatch(query, [
          shipment.orderNumber,
          shipment.externalOrderReference,
          clientName(shipment.clientId),
        ]);
        if (!matchedValue) return [];
        return [
          {
            id: shipment.id,
            matchedValue,
            orderNumber: shipment.orderNumber,
            externalOrderReference: shipment.externalOrderReference ?? null,
            clientName: clientName(shipment.clientId),
            transportContractorName: shipment.isAgency ? contractorName(shipment.transportContractorId) : null,
            isAgency: shipment.isAgency,
            cargos: shipment.cargo.map((cargo) => ({
              id: cargo.id,
              weight: cargo.weight,
              palleteType: (cargo.metadata.palleteType || null) as never,
              palleteAmount: cargo.metadata.palleteAmount,
              ldm: cargo.ldm,
              dimensions: null,
              description: cargo.description ?? null,
            })),
          },
        ];
      })
    : [];

  const fleet = types.has('FLEET')
    ? db.vozila.flatMap((vehicle) => {
        const matchedValue = firstMatch(query, [
          vehicle.registration,
          vehicle.brand,
          vehicle.vehicleIdentificationNumber,
        ]);
        return matchedValue
          ? [
              {
                id: vehicle.id,
                matchedValue,
                registration: vehicle.registration,
                brand: vehicle.brand,
                fleetType: vehicle.type,
              },
            ]
          : [];
      })
    : [];

  const employees = types.has('EMPLOYEES')
    ? db.zaposlenici
        .filter((employee) => !employee.deleted)
        .flatMap((employee) => {
          const matchedValue = firstMatch(query, [employee.fullName, employee.email, employee.phoneNumber]);
          return matchedValue
            ? [
                {
                  id: employee.id,
                  matchedValue,
                  firstName: employee.firstName,
                  lastName: employee.lastName,
                  email: employee.email,
                  phoneNumber: null,
                },
              ]
            : [];
        })
    : [];

  const partners = (list: { id: string; name: string; taxId: string }[]) =>
    list.flatMap((partner) => {
      const matchedValue = firstMatch(query, [partner.name, partner.taxId]);
      return matchedValue ? [{ id: partner.id, matchedValue, name: partner.name, vatNumber: partner.taxId }] : [];
    });

  return {
    shipments: page(shipments, limit),
    fleet: page(fleet, limit),
    employees: page(employees, limit),
    clients: page(types.has('CLIENTS') ? partners(db.partneri.clients) : [], limit),
    contractors: page(types.has('CONTRACTORS') ? partners(db.partneri.contractors) : [], limit),
  };
}

export const pretragaRoutes = [
  route('GET', '/api/search', ({ query }, db) => {
    const text = (query.get('q') ?? '').trim().toLowerCase();
    const limit = Number(query.get('limit') ?? 5);
    const types = new Set(query.get('types')?.split(',') ?? TYPES);
    return ok(search(db, text, limit, types));
  }),
];
