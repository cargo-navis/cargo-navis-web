import dayjs from 'dayjs';

import type { DriverCargoShipment, DriverStop, DriverStopCargo, DriverStopDocument } from '@/lib/api/driver.d';
import type { User } from '@/lib/api/user.d';
import type { VehicleStopAddress } from '@/lib/api/vehicleStops.d';

export const MOCK_DRIVER_ID = 'mock-driver-id';

export const mockAccount = {
  id: MOCK_DRIVER_ID,
  firstName: 'Ivan',
  lastName: 'Horvat',
  fullName: 'Ivan Horvat',
} as User;

const shipments: Record<string, DriverCargoShipment> = {
  s1: { id: 'shipment-1', orderNumber: '2026/1234' },
  s2: { id: 'shipment-2', orderNumber: '2026/1240' },
  s3: { id: 'shipment-3', orderNumber: '2026/1251' },
  s4: { id: 'shipment-4', orderNumber: '2026/1229' },
};

function address(streetName: string, postalCode: string, placeName: string, countryCode = 'HR'): VehicleStopAddress {
  return { streetName, postalCodeId: `pc-${postalCode}`, postalCode, countryCode, placeName };
}

let cargoCounter = 0;

function cargo(
  shipment: DriverCargoShipment,
  side: 'loading' | 'unloading',
  details: {
    companyName: string;
    reference?: string;
    description?: string;
    pallets: number;
    weight: number;
    ldm: number;
  }
): DriverStopCargo {
  cargoCounter += 1;
  const isLoading = side === 'loading';

  return {
    id: `cargo-${cargoCounter}`,
    shipment,
    weight: details.weight,
    ldm: details.ldm,
    description: null,
    metadata: { type: 'standard', palleteType: 'eur', palleteAmount: details.pallets, width: 0, height: 0, length: 0 },
    position: cargoCounter,
    loadingAddress: null,
    loadingCompanyName: isLoading ? details.companyName : null,
    loadingReadyDate: null,
    loadingDescription: isLoading ? (details.description ?? null) : null,
    loadingReference: isLoading ? (details.reference ?? null) : null,
    unloadingAddress: null,
    unloadingCompanyName: isLoading ? null : details.companyName,
    unloadingDueDate: null,
    unloadingDescription: isLoading ? null : (details.description ?? null),
    unloadingReference: isLoading ? null : (details.reference ?? null),
    // Set from the confirmed stops by syncMockLoadStatuses.
    loadStatus: 'not_yet_loaded',
  };
}

// The real API returns one cargo object on both its loading and its unloading stop; the mock builds two, matched by
// order and weight (unique in this data).
function cargoKey(cargo: DriverStopCargo) {
  return `${cargo.shipment.id}:${cargo.weight}`;
}

/** Recomputes every cargo's loadStatus from the confirmed stops, like the backend does on complete/uncomplete. */
export function syncMockLoadStatuses(stops: DriverStop[]) {
  const loaded = new Set<string>();
  const unloaded = new Set<string>();
  stops
    .filter((stop) => stop.completedAt)
    .forEach((stop) => {
      stop.loadingCargos.forEach((cargo) => loaded.add(cargoKey(cargo)));
      stop.unloadingCargos.forEach((cargo) => unloaded.add(cargoKey(cargo)));
    });

  stops
    .flatMap((stop) => [...stop.loadingCargos, ...stop.unloadingCargos])
    .forEach((cargo) => {
      const key = cargoKey(cargo);
      cargo.loadStatus = unloaded.has(key) ? 'unloaded' : loaded.has(key) ? 'loaded' : 'not_yet_loaded';
    });
}

function document(id: string, name: string, uploadedBy: string, createdAt: string): DriverStopDocument {
  return { id, name, createdAt, uploadedBy, mimeType: 'image/jpeg', status: 'uploaded', publicUrl: null };
}

/** Stops in route order, dates relative to today. */
export function createMockStops(): DriverStop[] {
  const today = dayjs().startOf('day');
  const day = (offset: number) => today.add(offset, 'day').format('YYYY-MM-DD');
  const at = (offset: number, hour: number) => today.add(offset, 'day').hour(hour).toISOString();

  const stops: DriverStop[] = [
    {
      id: 'stop-rijeka',
      address: address('Riva 1', '51000', 'Rijeka'),
      date: day(-2),
      completedAt: at(-2, 9),
      loadingCargos: [
        cargo(shipments.s4, 'loading', { companyName: 'Luka Rijeka d.d.', pallets: 6, weight: 4200, ldm: 2.4 }),
      ],
      unloadingCargos: [],
      documents: [document('doc-dispatcher', 'Nalog za utovar.jpg', 'dispatcher-id', at(-2, 8))],
    },
    {
      id: 'stop-graz',
      address: address('Lagergasse 12', '8020', 'Graz', 'AT'),
      date: day(-1),
      completedAt: at(-1, 14),
      loadingCargos: [],
      unloadingCargos: [
        cargo(shipments.s4, 'unloading', { companyName: 'Spar Österreich', pallets: 6, weight: 4200, ldm: 2.4 }),
      ],
      documents: [document('doc-driver', 'CMR.jpg', MOCK_DRIVER_ID, at(-1, 15))],
    },
    {
      id: 'stop-koprivnica',
      address: address('Ante Starčevića 32', '48000', 'Koprivnica'),
      date: day(-1),
      completedAt: null,
      loadingCargos: [
        cargo(shipments.s1, 'loading', {
          companyName: 'Podravka d.d.',
          reference: 'PO-88213',
          description: 'Rampa 4, prijava na porti',
          pallets: 12,
          weight: 8400,
          ldm: 4.8,
        }),
        cargo(shipments.s1, 'loading', {
          companyName: 'Podravka d.d.',
          reference: 'PO-88213',
          pallets: 2,
          weight: 900,
          ldm: 0.8,
        }),
        cargo(shipments.s2, 'loading', {
          companyName: 'Podravka d.d.',
          reference: 'PO-88214',
          pallets: 4,
          weight: 2100,
          ldm: 1.6,
        }),
      ],
      unloadingCargos: [],
      documents: [],
    },
    {
      id: 'stop-zagreb',
      address: address('Slavonska avenija 50', '10000', 'Zagreb'),
      date: day(0),
      completedAt: null,
      loadingCargos: [
        cargo(shipments.s3, 'loading', {
          companyName: 'Konzum d.d.',
          reference: 'KZ-4410',
          pallets: 8,
          weight: 5000,
          ldm: 3.2,
        }),
      ],
      unloadingCargos: [
        cargo(shipments.s2, 'unloading', { companyName: 'Konzum d.d.', pallets: 4, weight: 2100, ldm: 1.6 }),
      ],
      documents: [],
    },
    {
      id: 'stop-osijek',
      address: address('Industrijska zona 3', '31000', 'Osijek'),
      date: day(1),
      completedAt: null,
      loadingCargos: [],
      unloadingCargos: [
        cargo(shipments.s3, 'unloading', { companyName: 'Pivovara Osijek', pallets: 8, weight: 5000, ldm: 3.2 }),
      ],
      documents: [],
    },
    {
      id: 'stop-munchen',
      address: address('Landsberger Str. 300', '80687', 'München', 'DE'),
      date: day(4),
      completedAt: null,
      loadingCargos: [],
      unloadingCargos: [
        cargo(shipments.s1, 'unloading', {
          companyName: 'Spar GmbH',
          reference: 'DE-7781',
          description: 'Istovar samo do 14h',
          pallets: 12,
          weight: 8400,
          ldm: 4.8,
        }),
      ],
      documents: [],
    },
    {
      id: 'stop-salzburg',
      address: address('Münchner Bundesstraße 9', '5020', 'Salzburg', 'AT'),
      date: null,
      completedAt: null,
      loadingCargos: [],
      unloadingCargos: [
        cargo(shipments.s1, 'unloading', { companyName: 'Hofer KG', pallets: 2, weight: 900, ldm: 0.8 }),
      ],
      documents: [],
    },
  ];

  syncMockLoadStatuses(stops);
  return stops;
}
