import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import type { DriverStop, DriverStopCargo } from '@/lib/api/driver.d';
import type { VehicleStopAddress } from '@/lib/api/vehicleStops.d';

import {
  formatCargoMeasures,
  formatCargoTotals,
  formatCompletedAt,
  formatStopDate,
  getDisponentName,
  getDocumentIcon,
  getNavigationUrl,
  getNextStopId,
  getNotYetLoadedCargos,
  getPendingLoadingStops,
  getShortName,
  getStopClientNames,
  getStopClientsByKind,
  getStopKindLabels,
  getStopOrders,
  getStopsDisponent,
  getStopShortName,
  getStopTitle,
  getStopToastDescription,
  getStopWhen,
  groupCargosByShipment,
} from './utils';

const now = dayjs('2026-10-19T10:00:00');

function makeAddress(placeName: string): VehicleStopAddress {
  return { streetName: `${placeName} 1`, postalCodeId: 'pc', postalCode: '10000', countryCode: 'HR', placeName };
}

function makeCargo(shipmentId: string, overrides: Partial<DriverStopCargo> = {}): DriverStopCargo {
  return {
    id: `cargo-${shipmentId}-${Math.random()}`,
    shipment: { id: shipmentId, orderNumber: `#${shipmentId}`, clientName: null },
    weight: 1000,
    ldm: 2,
    description: null,
    metadata: { type: 'standard', palleteType: 'eur', palleteAmount: 2, width: 0, height: 0, length: 0 },
    position: 1,
    loadingAddress: null,
    loadingCompanyName: null,
    loadingReadyDate: null,
    loadingDescription: null,
    loadingReference: null,
    unloadingAddress: null,
    unloadingCompanyName: null,
    unloadingDueDate: null,
    unloadingDescription: null,
    unloadingReference: null,
    loadStatus: 'not_yet_loaded',
    ...overrides,
  };
}

function makeStop(id: string, overrides: Partial<DriverStop> = {}): DriverStop {
  return {
    id,
    address: makeAddress(`Place ${id}`),
    date: '2026-10-19',
    completedAt: null,
    loadingCargos: [makeCargo('s1')],
    unloadingCargos: [],
    documents: [],
    disponent: null,
    ...overrides,
  };
}

const ids = (stops: DriverStop[]) => stops.map((s) => s.id);

describe('getStopWhen', () => {
  const when = (date: string | null, completedAt: string | null = null) => getStopWhen({ date, completedAt }, now);

  it('shows when a completed stop was confirmed', () => {
    expect(when('2026-10-19', '2026-10-19T09:05:00')).toEqual({ primary: 'Danas', secondary: '09:05', isLate: false });
    expect(when('2026-10-18', '2026-10-18T17:45:00')).toEqual({ primary: 'Jučer', secondary: '17:45', isLate: false });
    expect(when('2026-10-16', '2026-10-16T08:00:00')).toEqual({
      primary: 'pet. 16.10.',
      secondary: '08:00',
      isLate: false,
    });
  });

  it('shows the day of a stop ahead', () => {
    expect(when('2026-10-19')).toEqual({ primary: 'Danas', secondary: null, isLate: false });
    expect(when('2026-10-20')).toEqual({ primary: 'Sutra', secondary: null, isLate: false });
    expect(when('2026-10-22')).toEqual({ primary: 'čet. 22.10.', secondary: null, isLate: false });
  });

  it('marks a stop not completed after its day as late', () => {
    expect(when('2026-10-17')).toEqual({ primary: 'Kasni', secondary: 'sub. 17.10.', isLate: true });
  });

  it('handles a missing date and other years', () => {
    expect(when(null)).toEqual({ primary: 'Bez datuma', secondary: null, isLate: false });
    expect(when('2027-01-05')).toEqual({ primary: 'uto. 5.1.2027.', secondary: null, isLate: false });
  });
});

describe('getNextStopId', () => {
  const done = '2026-10-18T08:00:00Z';

  it('picks the lowest stop not completed yet in the latest-first list', () => {
    const stops = [makeStop('C'), makeStop('B'), makeStop('A', { completedAt: done })];
    expect(getNextStopId(stops)).toBe('B');
  });

  it('is null when every stop is completed', () => {
    expect(getNextStopId([makeStop('A', { completedAt: done })])).toBeNull();
  });
});

describe('getStopOrders', () => {
  const orders = (stop: DriverStop) => getStopOrders(stop).map(({ kind, shipment }) => `${kind}:${shipment.id}`);

  it('lists each order once per kind, loading first', () => {
    const stop = makeStop('A', {
      loadingCargos: [makeCargo('s1'), makeCargo('s1'), makeCargo('s3')],
      unloadingCargos: [makeCargo('s2')],
    });
    expect(orders(stop)).toEqual(['loading:s1', 'loading:s3', 'unloading:s2']);
  });

  it('lists an order loaded and unloaded at the same stop twice', () => {
    const stop = makeStop('A', { loadingCargos: [makeCargo('s1')], unloadingCargos: [makeCargo('s1')] });
    expect(orders(stop)).toEqual(['loading:s1', 'unloading:s1']);
  });
});

describe('getStopClientsByKind', () => {
  const cargo = (shipmentId: string, clientName: string | null) =>
    makeCargo(shipmentId, { shipment: { id: shipmentId, orderNumber: `2026/${shipmentId}`, clientName } });

  it('groups clients by kind, loading first, each once', () => {
    const stop = makeStop('A', {
      loadingCargos: [cargo('1', 'Podravka d.d.'), cargo('2', 'Konzum'), cargo('3', 'Podravka d.d.')],
      unloadingCargos: [cargo('4', 'Kraš d.d.')],
    });
    expect(getStopClientsByKind(stop).map(({ kind, names, cargos }) => [kind, names, cargos.length])).toEqual([
      ['loading', ['Podravka d.d.', 'Konzum'], 3],
      ['unloading', ['Kraš d.d.'], 1],
    ]);
  });

  it('names an order without a client by its number', () => {
    const stop = makeStop('A', { loadingCargos: [], unloadingCargos: [cargo('5', null)] });
    expect(getStopClientsByKind(stop).map(({ names }) => names)).toEqual([['Nalog #2026/5']]);
  });
});

describe('formatCargoTotals', () => {
  const cargo = (pallets: number, weight: number | null) =>
    makeCargo('s1', {
      weight,
      metadata: { type: 'standard', palleteType: 'eur', palleteAmount: pallets, width: 0, height: 0, length: 0 },
    });

  it('adds up pallets and weight', () => {
    expect(formatCargoTotals([cargo(12, 8400), cargo(2, 900)])).toBe('14 paleta · 9.300 kg');
    expect(formatCargoTotals([cargo(2, 1000), cargo(1, 500)])).toBe('3 palete · 1.500 kg');
  });

  it('leaves out what no cargo has', () => {
    expect(formatCargoTotals([cargo(0, 1200)])).toBe('1.200 kg');
    expect(formatCargoTotals([cargo(4, null)])).toBe('4 palete');
    expect(formatCargoTotals([cargo(0, null)])).toBeNull();
  });
});

describe('getStopKindLabels', () => {
  it('labels loading-only stop', () => {
    expect(getStopKindLabels(makeStop('A'))).toEqual({
      title: 'UTOVAR',
      action: 'Potvrdi utovar',
      confirmed: 'Utovar potvrđen',
    });
  });

  it('labels unloading-only stop', () => {
    expect(getStopKindLabels(makeStop('A', { loadingCargos: [], unloadingCargos: [makeCargo('s1')] }))).toEqual({
      title: 'ISTOVAR',
      action: 'Potvrdi istovar',
      confirmed: 'Istovar potvrđen',
    });
  });

  it('labels stop with both', () => {
    expect(
      getStopKindLabels(makeStop('A', { loadingCargos: [makeCargo('s1')], unloadingCargos: [makeCargo('s2')] }))
    ).toEqual({
      title: 'UTOVAR I ISTOVAR',
      action: 'Potvrdi utovar i istovar',
      confirmed: 'Postaja potvrđena',
    });
  });
});

describe('getStopToastDescription', () => {
  const cargo = (shipmentId: string, orderNumber: string, clientName: string | null = null) =>
    makeCargo(shipmentId, { shipment: { id: shipmentId, orderNumber, clientName } });

  it('combines the client and the order number', () => {
    const stop = makeStop('A', { loadingCargos: [cargo('s1', '2026/1234', 'Podravka d.d.')] });
    expect(getStopToastDescription(stop)).toBe('Podravka d.d. • #2026/1234');
  });

  it('lists every client and order of the stop once', () => {
    const stop = makeStop('A', {
      loadingCargos: [
        cargo('s1', '2026/1234', 'Podravka d.d.'),
        cargo('s1', '2026/1234', 'Podravka d.d.'),
        cargo('s2', '2026/1240', 'Konzum'),
      ],
    });
    expect(getStopToastDescription(stop)).toBe('Podravka d.d., Konzum • #2026/1234 • #2026/1240');
  });

  it('leaves out a missing client', () => {
    const stop = makeStop('A', { loadingCargos: [], unloadingCargos: [cargo('s1', '2026/1234')] });
    expect(getStopToastDescription(stop)).toBe('#2026/1234');
  });
});

describe('getNavigationUrl', () => {
  const base = 'https://www.google.com/maps/search/?api=1&query=';

  it('builds google maps search url', () => {
    const address = {
      streetName: 'Ante Starčevića 32',
      postalCodeId: 'pc',
      postalCode: '48000',
      countryCode: 'HR',
      placeName: 'Koprivnica',
    };
    expect(getNavigationUrl(address)).toBe(base + encodeURIComponent('Ante Starčevića 32, 48000 Koprivnica'));
  });

  it('skips null parts', () => {
    const address = {
      streetName: null,
      postalCodeId: 'pc',
      postalCode: '48000',
      countryCode: 'HR',
      placeName: 'Koprivnica',
    };
    expect(getNavigationUrl(address)).toBe(base + encodeURIComponent('48000 Koprivnica'));
  });

  it('returns null for null address', () => {
    expect(getNavigationUrl(null)).toBeNull();
  });
});

describe('groupCargosByShipment', () => {
  it('groups cargos by shipment.id preserving first-seen order', () => {
    const a1 = makeCargo('a');
    const b1 = makeCargo('b');
    const a2 = makeCargo('a');
    const groups = groupCargosByShipment([a1, b1, a2]);
    expect(groups.map((g) => g.shipment.id)).toEqual(['a', 'b']);
    expect(groups[0].cargos).toEqual([a1, a2]);
    expect(groups[1].cargos).toEqual([b1]);
  });
});

describe('formatCompletedAt', () => {
  // now: Monday 2026-10-19 10:00
  it('shows "Danas" for today', () => {
    expect(formatCompletedAt('2026-10-19T09:05:00', now)).toBe('Danas · 09:05');
  });

  it('shows "Jučer" for yesterday', () => {
    expect(formatCompletedAt('2026-10-18T17:45:00', now)).toBe('Jučer · 17:45');
  });

  it('shows weekday and date for older days this year', () => {
    expect(formatCompletedAt('2026-10-12T09:00:00', now)).toBe('pon. 12.10. · 09:00');
  });

  it('adds the full year for another year', () => {
    expect(formatCompletedAt('2025-12-30T08:30:00', now)).toBe('uto. 30.12.2025. · 08:30');
  });
});

describe('formatStopDate', () => {
  it('formats today as "Danas"', () => {
    expect(formatStopDate('2026-10-19', now)).toBe('Danas');
  });

  it('formats tomorrow as "Sutra"', () => {
    expect(formatStopDate('2026-10-20', now)).toBe('Sutra');
  });

  it('formats other dates as "ddd D.M." in hr', () => {
    expect(formatStopDate('2026-10-22', now)).toBe('čet. 22.10.');
  });

  it('returns "Bez datuma" for null', () => {
    expect(formatStopDate(null, now)).toBe('Bez datuma');
  });
});

describe('formatCargoMeasures', () => {
  it('formats weight and ldm in hr locale', () => {
    expect(formatCargoMeasures({ weight: 8400, ldm: 4.8 })).toEqual(['8.400 kg', '4,8 ldm']);
  });

  it('skips missing weight or ldm instead of crashing', () => {
    expect(formatCargoMeasures({ weight: 900, ldm: null })).toEqual(['900 kg']);
    expect(formatCargoMeasures({ weight: null, ldm: null })).toEqual([]);
  });
});

describe('getDocumentIcon', () => {
  const doc = (name: string, mimeType: string) => ({ name, mimeType });

  it('picks the icon from the mime type', () => {
    expect(getDocumentIcon(doc('cmr', 'application/pdf'))).toBe('IconFileTypePdf');
    expect(getDocumentIcon(doc('photo', 'image/jpeg'))).toBe('IconFileTypeJpg');
    expect(getDocumentIcon(doc('scan', 'image/png'))).toBe('IconFileTypePng');
  });

  it('uses a photo icon for other images', () => {
    expect(getDocumentIcon(doc('IMG_0042.HEIC', 'image/heic'))).toBe('IconPhoto');
  });

  it('falls back to the file extension when the mime type is generic', () => {
    expect(getDocumentIcon(doc('Racun.DOCX', 'application/octet-stream'))).toBe('IconFileTypeDocx');
    expect(getDocumentIcon(doc('popis.xlsx', ''))).toBe('IconFileTypeXls');
    expect(getDocumentIcon(doc('export.csv', 'text/csv'))).toBe('IconFileTypeCsv');
  });

  it('uses a plain file icon for unknown types', () => {
    expect(getDocumentIcon(doc('data.bin', 'application/octet-stream'))).toBe('IconFile');
  });
});

describe('getNotYetLoadedCargos', () => {
  it('returns unloading cargo that is not loaded yet', () => {
    const notLoaded = makeCargo('s1');
    const loaded = makeCargo('s2', { loadStatus: 'loaded' });
    const stop = makeStop('U', { loadingCargos: [], unloadingCargos: [notLoaded, loaded] });
    expect(getNotYetLoadedCargos(stop)).toEqual([notLoaded]);
  });

  it('ignores cargo loaded at the same stop', () => {
    const cargo = makeCargo('s1');
    const stop = makeStop('M', { loadingCargos: [cargo], unloadingCargos: [cargo] });
    expect(getNotYetLoadedCargos(stop)).toEqual([]);
  });

  it('is empty for a loading-only stop', () => {
    expect(getNotYetLoadedCargos(makeStop('L'))).toEqual([]);
  });
});

describe('getPendingLoadingStops', () => {
  const cargo = makeCargo('s1');

  it('returns unconfirmed stops that load the cargo', () => {
    const loading = makeStop('L', { loadingCargos: [cargo] });
    const other = makeStop('O', { loadingCargos: [makeCargo('s2')] });
    expect(ids(getPendingLoadingStops([cargo], [loading, other]))).toEqual(['L']);
  });

  it('skips confirmed stops', () => {
    const loading = makeStop('L', { loadingCargos: [cargo], completedAt: '2026-10-19T08:00:00Z' });
    expect(getPendingLoadingStops([cargo], [loading])).toEqual([]);
  });
});

describe('getStopShortName', () => {
  it('uses the title and the place, not the company', () => {
    const stop = makeStop('A', {
      loadingCargos: [
        makeCargo('s1', {
          shipment: { id: 's1', orderNumber: '1', clientName: 'Podravka d.d.' },
          loadingCompanyName: 'Skladište',
        }),
      ],
    });
    expect(getStopShortName(stop)).toBe('Podravka d.d. (Place A)');
  });

  it('falls back to the place', () => {
    expect(getStopShortName(makeStop('A', { loadingCargos: [] }))).toBe('Place A');
  });
});

describe('getDisponentName', () => {
  it('joins first and last name', () => {
    expect(getDisponentName({ firstName: 'Dario', lastName: 'Jukić', phoneNumber: null })).toBe('Dario Jukić');
  });

  it('is null without a name', () => {
    expect(getDisponentName({ firstName: null, lastName: null, phoneNumber: '+385915632655' })).toBeNull();
  });
});

describe('getStopsDisponent', () => {
  const dario = { firstName: 'Dario', lastName: 'Jukić', phoneNumber: '+385915632655' };

  it('takes the first stop that has a dispatcher', () => {
    expect(getStopsDisponent([makeStop('A'), makeStop('B', { disponent: dario })])).toEqual(dario);
  });

  it('skips a dispatcher with neither name nor number', () => {
    const empty = { firstName: null, lastName: null, phoneNumber: null };
    expect(getStopsDisponent([makeStop('A', { disponent: empty })])).toBeNull();
  });
});

describe('getShortName', () => {
  it('abbreviates the first name', () => {
    expect(getShortName({ firstName: 'Ivan', lastName: 'Horvat' })).toBe('I. Horvat');
  });

  it('falls back to whichever part exists', () => {
    expect(getShortName({ firstName: 'Ivan', lastName: null })).toBe('Ivan');
    expect(getShortName({ firstName: ' ', lastName: 'Horvat' })).toBe('Horvat');
    expect(getShortName({ firstName: null, lastName: null })).toBeUndefined();
  });
});

describe('getStopClientNames', () => {
  it('lists each client once', () => {
    const podravka = { id: 's1', orderNumber: '1', clientName: 'Podravka d.d.' };
    const stop = makeStop('A', {
      loadingCargos: [makeCargo('s1', { shipment: podravka }), makeCargo('s1', { shipment: podravka })],
      unloadingCargos: [makeCargo('s2', { shipment: { id: 's2', orderNumber: '2', clientName: 'Konzum' } })],
    });
    expect(getStopClientNames(stop)).toEqual(['Podravka d.d.', 'Konzum']);
  });
});

describe('getStopTitle', () => {
  it('uses the clients', () => {
    const stop = makeStop('A', {
      loadingCargos: [
        makeCargo('s1', {
          shipment: { id: 's1', orderNumber: '1', clientName: 'Podravka d.d.' },
          loadingCompanyName: 'Skladište Koprivnica',
        }),
      ],
    });
    expect(getStopTitle(stop)).toBe('Podravka d.d.');
  });

  it('falls back to the order numbers', () => {
    const stop = makeStop('A', { loadingCargos: [makeCargo('s1', { loadingCompanyName: 'Skladište Koprivnica' })] });
    expect(getStopTitle(stop)).toBe('Nalog ##s1');
  });
});
