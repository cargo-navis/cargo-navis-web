/**
 * One-line overview (lab /order SummaryStrip): Ruta (first → last place, dates, „još N mjesta”), Teret (LDM · kg,
 * tereti · palete), Vozilo / Kontraktor, Cijena with the invoice pill (agency: + zarada).
 */

import type { Shipment } from '@/lib/api';
import { formatDateShort } from '@/lib/utils/date';
import { pluralCount } from '@/lib/utils/plural';

import { cargoTotals } from '../shared/cargo';
import { formatEuro, formatKg, formatNumber, getMargin } from '../shared/format';
import { getInvoiceInfo } from '../shared/invoice';
import { InvoiceBadge } from '../shared/InvoiceCell';
import { getLatestStop, useLookups } from '../shared/lookups';
import { sortStops } from './RouteTimeline';

interface Point {
  place?: string | null;
  date?: string | null;
}

/** First and last point of the route: the vehicle stops when assigned, else the cargo's loadings / unloadings. */
function routeEnds(shipment: Shipment): { first?: Point; last?: Point; count: number } {
  const stops = sortStops(shipment.vehicleStops ?? []);
  if (stops.length) {
    return {
      first: { place: stops[0].address?.placeName, date: stops[0].date },
      last: { place: stops.at(-1)?.address?.placeName, date: stops.at(-1)?.date },
      count: stops.length,
    };
  }
  const key = (address?: { postalCodeId?: string; streetName?: string } | null) =>
    address ? `${address.postalCodeId}|${address.streetName}` : '';
  const loadings = shipment.cargo
    .filter((cargo) => cargo.loadingAddress)
    .sort((a, b) => (a.loadingReadyDate ?? '').localeCompare(b.loadingReadyDate ?? ''));
  const unloadings = shipment.cargo
    .filter((cargo) => cargo.unloadingAddress)
    .sort((a, b) => (a.unloadingDueDate ?? '').localeCompare(b.unloadingDueDate ?? ''));
  const count =
    new Set(loadings.map((cargo) => key(cargo.loadingAddress))).size +
    new Set(unloadings.map((cargo) => key(cargo.unloadingAddress))).size;
  return {
    first: loadings[0] && { place: loadings[0].loadingAddress.placeName, date: loadings[0].loadingReadyDate },
    last: unloadings.at(-1) && {
      place: unloadings.at(-1)?.unloadingAddress.placeName,
      date: unloadings.at(-1)?.unloadingDueDate,
    },
    count,
  };
}

export function SummaryStrip({ shipment }: { shipment: Shipment }) {
  const { clientsById, contractorsById, vehiclesById, employeesById } = useLookups();
  const totals = cargoTotals(shipment.cargo);
  const { first, last, count } = routeEnds(shipment);
  const others = Math.max(0, count - 2);
  const latestStop = getLatestStop(shipment);
  const vehicle = latestStop ? vehiclesById.get(latestStop.vehicleId) : undefined;
  const driver = latestStop?.driverId ? employeesById.get(latestStop.driverId) : undefined;
  const contractor = shipment.transportContractorId ? contractorsById.get(shipment.transportContractorId) : undefined;
  const client = shipment.clientId ? clientsById.get(shipment.clientId) : undefined;
  const margin =
    shipment.isAgency && shipment.contractorPrice !== null && shipment.contractorPrice !== undefined
      ? getMargin(shipment.price ?? 0, shipment.contractorPrice)
      : undefined;
  const shortDate = (date?: string | null) => (date ? formatDateShort(date) : '—');

  const items: { label: string; value: string; detail: React.ReactNode }[] = [
    {
      label: 'Ruta',
      value: first || last ? `${first?.place ?? '—'} → ${last?.place ?? '—'}` : '—',
      detail: `${shortDate(first?.date)} → ${shortDate(last?.date)}${others ? ` · još ${pluralCount(others, ['mjesto', 'mjesta', 'mjesta'])}` : ''}`,
    },
    {
      label: 'Teret',
      value: `${formatNumber(totals.ldm)} LDM · ${formatKg(totals.weightKg)}`,
      detail: `${pluralCount(shipment.cargo.length, ['teret', 'tereta', 'tereta'])}${totals.pallets ? ` · ${pluralCount(totals.pallets, ['paleta', 'palete', 'paleta'])}` : ''}`,
    },
    shipment.isAgency
      ? { label: 'Kontraktor', value: contractor?.name ?? '—', detail: 'agencijski nalog' }
      : {
          label: 'Vozilo',
          value: vehicle?.registration ?? 'Nije dodijeljeno',
          detail: vehicle ? (driver?.fullName ?? 'Bez vozača') : 'Dodijeli vozilo i vozača',
        },
    {
      label: 'Cijena',
      value: formatEuro(shipment.price ?? 0),
      detail: (
        <span className="flex items-center gap-2">
          <InvoiceBadge info={getInvoiceInfo(shipment, client)} size="sm" />
          {margin && (
            <span className="tabular-nums">
              {margin.isLoss ? 'gubitak' : 'zarada'} {formatEuro(Math.abs(margin.earnings))}
            </span>
          )}
        </span>
      ),
    },
  ];

  return (
    <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div className="flex min-w-0 flex-col gap-0.5 bg-card px-4 py-3" key={item.label}>
          <span className="text-xs text-muted-foreground">{item.label}</span>
          <span className="truncate font-heading text-lg font-bold tracking-tight tabular-nums">{item.value}</span>
          <span className="min-w-0 truncate text-xs text-muted-foreground">{item.detail}</span>
        </div>
      ))}
    </div>
  );
}
