import dayjs from 'dayjs';

import type {
  DriverCargoShipment,
  DriverShipment,
  DriverStop,
  DriverStopCargo,
  DriverStopDisponent,
  DriverStopDocument,
} from '@/lib/api/driver.d';
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
  s1: { id: 'shipment-1', orderNumber: '2026/1234', clientName: 'Podravka d.d.' },
  // Long on purpose, to check how client names overflow.
  s2: { id: 'shipment-2', orderNumber: '2026/1240', clientName: 'Konzum plus Transportation services' },
  s3: { id: 'shipment-3', orderNumber: '2026/1251', clientName: 'Atlantic Grupa d.d.' },
  s4: { id: 'shipment-4', orderNumber: '2026/1229', clientName: 'Lidl Hrvatska d.o.o.' },
  s5: { id: 'shipment-5', orderNumber: '2026/1262', clientName: 'Kraš d.d.' },
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

const MOCK_DISPONENT: DriverStopDisponent = { firstName: 'Dario', lastName: 'Jukić', phoneNumber: '+385915632655' };

type DayFormatter = (offset: number) => string;
type TimeFormatter = (offset: number, hour: number) => string;

const HISTORY_SHIPMENT_COUNT = 20;
const HISTORY_CLIENTS = ['Kraš d.d.', 'Vindija d.d.', 'Podravka d.d.', 'Atlantic Grupa d.d.', 'Zvijezda d.d.'];
const HISTORY_ROUTES = [
  {
    from: address('Radnička cesta 80', '10000', 'Zagreb'),
    loadingCompany: 'Kraš d.d.',
    to: address('Letališka cesta 3', '1000', 'Ljubljana', 'SI'),
    unloadingCompany: 'Mercator d.d.',
  },
  {
    from: address('Vukovarska 148', '21000', 'Split'),
    loadingCompany: 'Dalmacijavino d.d.',
    to: address('Jankomir 33', '10000', 'Zagreb'),
    unloadingCompany: 'Konzum d.d.',
  },
  {
    from: address('Međimurska 28', '42000', 'Varaždin'),
    loadingCompany: 'Vindija d.d.',
    to: address('Industriestraße 5', '1220', 'Wien', 'AT'),
    unloadingCompany: 'Billa AG',
  },
  {
    from: address('Vukovarska cesta 239', '31000', 'Osijek'),
    loadingCompany: 'Žito d.o.o.',
    to: address('Váci út 22', '1132', 'Budapest', 'HU'),
    unloadingCompany: 'Tesco Global Zrt.',
  },
  {
    from: address('Bakarska 2', '51000', 'Rijeka'),
    loadingCompany: 'Luka Rijeka d.d.',
    to: address('Via Flavia 120', '34147', 'Trieste', 'IT'),
    unloadingCompany: 'Interporto Trieste',
  },
];

/**
 * Older orders the driver already delivered, oldest first like the route, so the paginated lists span several pages.
 * Each order has one loading and one unloading stop on consecutive days; the newest one is unloaded 3 days ago.
 */
function createHistoryStops(day: DayFormatter, at: TimeFormatter): DriverStop[] {
  return Array.from({ length: HISTORY_SHIPMENT_COUNT }, (_, index) => {
    const route = HISTORY_ROUTES[index % HISTORY_ROUTES.length];
    const shipment: DriverCargoShipment = {
      id: `history-shipment-${index + 1}`,
      orderNumber: `2026/${1100 + index}`,
      clientName: HISTORY_CLIENTS[index % HISTORY_CLIENTS.length],
    };
    const pallets = 10 + (index % 5) * 2;
    const measures = { pallets, weight: 3000 + index * 250, ldm: pallets * 0.4 };
    const loadingDay = -2 * (HISTORY_SHIPMENT_COUNT - index) - 2;
    const unloadingDay = loadingDay + 1;

    const loadingStop: DriverStop = {
      id: `stop-history-${index + 1}-loading`,
      address: route.from,
      date: day(loadingDay),
      completedAt: at(loadingDay, 10),
      loadingCargos: [cargo(shipment, 'loading', { companyName: route.loadingCompany, ...measures })],
      unloadingCargos: [],
      documents: [],
      disponent: MOCK_DISPONENT,
    };
    const unloadingStop: DriverStop = {
      id: `stop-history-${index + 1}-unloading`,
      address: route.to,
      date: day(unloadingDay),
      completedAt: at(unloadingDay, 15),
      loadingCargos: [],
      unloadingCargos: [cargo(shipment, 'unloading', { companyName: route.unloadingCompany, ...measures })],
      documents: [document(`doc-history-${index + 1}`, 'CMR.jpg', MOCK_DRIVER_ID, at(unloadingDay, 16))],
      disponent: MOCK_DISPONENT,
    };

    return [loadingStop, unloadingStop];
  }).flat();
}

/**
 * The orders the driver has stops on, latest first (by the route position of their last stop). Each holds only its
 * own cargos on its stops, in route order.
 */
export function buildMockShipments(stops: DriverStop[]): DriverShipment[] {
  const shipments = new Map<string, DriverShipment>();
  const lastStopIndex = new Map<string, number>();

  stops.forEach((stop, index) => {
    const shipmentIds = new Set([...stop.loadingCargos, ...stop.unloadingCargos].map((cargo) => cargo.shipment.id));

    shipmentIds.forEach((shipmentId) => {
      const loadingCargos = stop.loadingCargos.filter((cargo) => cargo.shipment.id === shipmentId);
      const unloadingCargos = stop.unloadingCargos.filter((cargo) => cargo.shipment.id === shipmentId);
      const { orderNumber, clientName } = (loadingCargos[0] ?? unloadingCargos[0]).shipment;

      const shipment = shipments.get(shipmentId) ?? {
        id: shipmentId,
        orderNumber,
        clientName,
        origin: null,
        destination: null,
        completedStopsCount: 0,
        totalStopsCount: 0,
        stops: [],
      };
      shipments.set(shipmentId, shipment);

      shipment.stops.push({ ...stop, loadingCargos, unloadingCargos });
      shipment.totalStopsCount += 1;
      if (stop.completedAt) shipment.completedStopsCount += 1;
      if (loadingCargos.length > 0 && !shipment.origin) shipment.origin = stop.address;
      if (unloadingCargos.length > 0) shipment.destination = stop.address;
      lastStopIndex.set(shipmentId, index);
    });
  });

  return Array.from(shipments.values()).sort((a, b) => lastStopIndex.get(b.id)! - lastStopIndex.get(a.id)!);
}

/** Stops in route order, dates relative to today. */
export function createMockStops(): DriverStop[] {
  const today = dayjs().startOf('day');
  const day: DayFormatter = (offset) => today.add(offset, 'day').format('YYYY-MM-DD');
  const at: TimeFormatter = (offset, hour) => today.add(offset, 'day').hour(hour).toISOString();

  const stops: DriverStop[] = [
    ...createHistoryStops(day, at),
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
      disponent: MOCK_DISPONENT,
    },
    {
      id: 'stop-graz',
      address: address('Lagergasse 12', '8020', 'Graz', 'AT'),
      date: day(-1),
      completedAt: at(-1, 14),
      loadingCargos: [cargo(shipments.s5, 'loading', { companyName: 'Magna Steyr', pallets: 5, weight: 3100, ldm: 2 })],
      unloadingCargos: [
        cargo(shipments.s4, 'unloading', { companyName: 'Spar Österreich', pallets: 6, weight: 4200, ldm: 2.4 }),
      ],
      documents: [document('doc-driver', 'CMR.jpg', MOCK_DRIVER_ID, at(-1, 15))],
      disponent: MOCK_DISPONENT,
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
      // Cargo picked up in Graz, so the next stop both unloads and loads.
      unloadingCargos: [
        cargo(shipments.s5, 'unloading', { companyName: 'Podravka d.d.', pallets: 5, weight: 3100, ldm: 2 }),
      ],
      documents: [],
      disponent: MOCK_DISPONENT,
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
      disponent: MOCK_DISPONENT,
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
      disponent: MOCK_DISPONENT,
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
      disponent: MOCK_DISPONENT,
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
      disponent: MOCK_DISPONENT,
    },
  ];

  syncMockLoadStatuses(stops);
  return stops;
}
