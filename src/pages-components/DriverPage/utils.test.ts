import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import type { DriverStop, DriverStopCargo } from '@/lib/api/driver.d';
import type { VehicleStopAddress } from '@/lib/api/vehicleStops.d';

import {
  buildDriverShipments,
  buildRouteTimeline,
  formatCargoMeasures,
  formatStopDate,
  getDayDividerLabel,
  getDocumentIcon,
  getNavigationUrl,
  getStopCompanyName,
  getStopKindLabels,
  getStopToastDescription,
  groupCargosByShipment,
} from './utils';

const now = dayjs('2026-10-19T10:00:00');

function makeAddress(placeName: string): VehicleStopAddress {
  return { streetName: `${placeName} 1`, postalCodeId: 'pc', postalCode: '10000', countryCode: 'HR', placeName };
}

function makeCargo(shipmentId: string, overrides: Partial<DriverStopCargo> = {}): DriverStopCargo {
  return {
    id: `cargo-${shipmentId}-${Math.random()}`,
    shipment: { id: shipmentId, orderNumber: `#${shipmentId}` },
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
    ...overrides,
  };
}

const ids = (stops: DriverStop[]) => stops.map((s) => s.id);

describe('getDayDividerLabel', () => {
  it('labels past dates as late', () => {
    expect(getDayDividerLabel('2026-10-18', now)).toEqual({ label: 'Kasni · ned. 18.10.', isLate: true });
  });

  it('labels today', () => {
    expect(getDayDividerLabel('2026-10-19', now)).toEqual({ label: 'Danas · pon. 19.10.', isLate: false });
  });

  it('labels tomorrow', () => {
    expect(getDayDividerLabel('2026-10-20', now)).toEqual({ label: 'Sutra · uto. 20.10.', isLate: false });
  });

  it('labels later dates with weekday and date', () => {
    expect(getDayDividerLabel('2026-10-22', now)).toEqual({ label: 'čet. 22.10.', isLate: false });
  });

  it('labels missing dates', () => {
    expect(getDayDividerLabel(null, now)).toEqual({ label: 'Bez datuma', isLate: false });
  });
});

describe('buildRouteTimeline', () => {
  const done = '2026-10-18T08:00:00Z';

  it('keeps completed stops apart, in route order', () => {
    const timeline = buildRouteTimeline(
      [makeStop('A', { completedAt: done }), makeStop('B'), makeStop('C', { completedAt: done })],
      now
    );
    expect(ids(timeline.completed)).toEqual(['A', 'C']);
    expect(timeline.days.flatMap((day) => ids(day.stops))).toEqual(['B']);
  });

  it('marks the first active stop in route order as next', () => {
    const timeline = buildRouteTimeline(
      [makeStop('A', { completedAt: done }), makeStop('B', { date: '2026-10-20' }), makeStop('C')],
      now
    );
    expect(timeline.nextStopId).toBe('B');
  });

  it('groups consecutive active stops by day without reordering them', () => {
    const timeline = buildRouteTimeline(
      [
        makeStop('A', { date: '2026-10-18' }),
        makeStop('B', { date: '2026-10-19' }),
        makeStop('C', { date: '2026-10-19' }),
        makeStop('D', { date: null }),
      ],
      now
    );
    expect(timeline.days.map((day) => [day.label, ids(day.stops), day.isLate])).toEqual([
      ['Kasni · ned. 18.10.', ['A'], true],
      ['Danas · pon. 19.10.', ['B', 'C'], false],
      ['Bez datuma', ['D'], false],
    ]);
  });

  it('repeats a day divider when the route goes back to an earlier day', () => {
    const timeline = buildRouteTimeline(
      [
        makeStop('A', { date: '2026-10-19' }),
        makeStop('B', { date: '2026-10-20' }),
        makeStop('C', { date: '2026-10-19' }),
      ],
      now
    );
    expect(timeline.days.map((day) => day.label)).toEqual([
      'Danas · pon. 19.10.',
      'Sutra · uto. 20.10.',
      'Danas · pon. 19.10.',
    ]);
    expect(new Set(timeline.days.map((day) => day.key)).size).toBe(3);
  });

  it('has no next stop and no days when every stop is completed', () => {
    const timeline = buildRouteTimeline([makeStop('A', { completedAt: done })], now);
    expect(timeline.nextStopId).toBeNull();
    expect(timeline.days).toEqual([]);
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

describe('getStopCompanyName', () => {
  it('prefers first loadingCompanyName of loading cargos', () => {
    const stop = makeStop('A', {
      loadingCargos: [makeCargo('s1'), makeCargo('s2', { loadingCompanyName: 'Podravka d.d.' })],
      unloadingCargos: [makeCargo('s3', { unloadingCompanyName: 'Konzum d.d.' })],
    });
    expect(getStopCompanyName(stop)).toBe('Podravka d.d.');
  });

  it('falls back to unloadingCompanyName of unloading cargos', () => {
    const stop = makeStop('A', {
      loadingCargos: [makeCargo('s1')],
      unloadingCargos: [makeCargo('s3', { unloadingCompanyName: 'Konzum d.d.' })],
    });
    expect(getStopCompanyName(stop)).toBe('Konzum d.d.');
  });

  it('returns null when no company names', () => {
    expect(getStopCompanyName(makeStop('A'))).toBeNull();
  });
});

describe('getStopToastDescription', () => {
  const cargo = (shipmentId: string, orderNumber: string, overrides: Partial<DriverStopCargo> = {}) =>
    makeCargo(shipmentId, { shipment: { id: shipmentId, orderNumber }, ...overrides });

  it('combines the company name and the order number', () => {
    const stop = makeStop('A', { loadingCargos: [cargo('s1', '2026/1234', { loadingCompanyName: 'Podravka d.d.' })] });
    expect(getStopToastDescription(stop)).toBe('Podravka d.d. • #2026/1234');
  });

  it('lists every order of the stop once', () => {
    const stop = makeStop('A', {
      loadingCargos: [
        cargo('s1', '2026/1234', { loadingCompanyName: 'Podravka d.d.' }),
        cargo('s1', '2026/1234'),
        cargo('s2', '2026/1240'),
      ],
    });
    expect(getStopToastDescription(stop)).toBe('Podravka d.d. • #2026/1234 • #2026/1240');
  });

  it('leaves out a missing company name', () => {
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

describe('buildDriverShipments', () => {
  it("collects each shipment's stops in route order", () => {
    const stops = [
      makeStop('L1', { loadingCargos: [makeCargo('s1')] }),
      makeStop('L2', { loadingCargos: [makeCargo('s2')] }),
      makeStop('U1', { loadingCargos: [], unloadingCargos: [makeCargo('s1')] }),
    ];
    const s1 = buildDriverShipments(stops).find((s) => s.id === 's1');
    expect(ids(s1!.stops)).toEqual(['L1', 'U1']);
  });

  it("keeps only that shipment's cargos at a stop shared by two shipments", () => {
    const stops = [
      makeStop('L', { loadingCargos: [makeCargo('s1'), makeCargo('s2')] }),
      makeStop('U', { loadingCargos: [], unloadingCargos: [makeCargo('s1'), makeCargo('s2')] }),
    ];
    const s2 = buildDriverShipments(stops).find((s) => s.id === 's2')!;
    expect(s2.stops[0].loadingCargos.map((c) => c.shipment.id)).toEqual(['s2']);
    expect(s2.stops[1].unloadingCargos.map((c) => c.shipment.id)).toEqual(['s2']);
  });

  it('omits shipments whose stops are all completed', () => {
    const done = '2026-10-18T08:00:00Z';
    const stops = [
      makeStop('L1', { loadingCargos: [makeCargo('s1')], completedAt: done }),
      makeStop('U1', { loadingCargos: [], unloadingCargos: [makeCargo('s1')], completedAt: done }),
      makeStop('L2', { loadingCargos: [makeCargo('s2')] }),
    ];
    expect(buildDriverShipments(stops).map((s) => s.id)).toEqual(['s2']);
  });

  it('orders shipments by the route position of their first active stop', () => {
    const done = '2026-10-18T08:00:00Z';
    const stops = [
      makeStop('L1', { loadingCargos: [makeCargo('s1')], completedAt: done }),
      makeStop('L2', { loadingCargos: [makeCargo('s2')] }),
      makeStop('U1', { loadingCargos: [], unloadingCargos: [makeCargo('s1')] }),
    ];
    expect(buildDriverShipments(stops).map((s) => s.id)).toEqual(['s2', 's1']);
  });

  it('uses first loading stop address as origin and last unloading stop address as destination', () => {
    const stops = [
      makeStop('L1', { address: makeAddress('Koprivnica'), loadingCargos: [makeCargo('s1')] }),
      makeStop('U1', { address: makeAddress('Graz'), loadingCargos: [], unloadingCargos: [makeCargo('s1')] }),
      makeStop('U2', { address: makeAddress('München'), loadingCargos: [], unloadingCargos: [makeCargo('s1')] }),
    ];
    const [s1] = buildDriverShipments(stops);
    expect(s1.origin?.placeName).toBe('Koprivnica');
    expect(s1.destination?.placeName).toBe('München');
  });

  it('counts completed and total stops', () => {
    const stops = [
      makeStop('L1', { loadingCargos: [makeCargo('s1')], completedAt: '2026-10-18T08:00:00Z' }),
      makeStop('U1', { loadingCargos: [], unloadingCargos: [makeCargo('s1')] }),
    ];
    const [s1] = buildDriverShipments(stops);
    expect(s1).toMatchObject({ completedStopsCount: 1, totalStopsCount: 2, orderNumber: '#s1' });
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
