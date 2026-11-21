import * as React from 'react';

import { VehicleEnum } from '@/lib/api';
import {
  useClients,
  useClientsAnalytics,
  useContractors,
  useDriversAnalytics,
  useEmployees,
  useTransportContractorsAnalytics,
  useVehicles,
  useVehiclesAnalytics,
} from '@/lib/hooks/api';
import { plural } from '@/lib/utils/plural';

import { vehicleHref } from '../FleetPage/fleet';
import { ChartCard, type Period } from './ChartCard';
import { type Filters, GRANULARITY } from './filters';
import { eur, int, percent } from './format';
import { Delta, StatTile, StatTilesGrid } from './StatTile';
import { ContractorsTable, type RankingRow, RankingTable } from './tables';
import type { PeriodsData } from './usePeriods';

const TOP_N = 5;

/** A retry for a ranking table whose list failed and has nothing to show. */
const retryOnError = (query: { isError: boolean; data: unknown; refetch(): unknown }) =>
  query.isError && query.data === undefined ? () => void query.refetch() : undefined;

const VEHICLE_TYPE_LABEL: Record<VehicleEnum, string> = {
  [VehicleEnum.TRUCK]: 'Tegljač',
  [VehicleEnum.TRAILER]: 'Poluprikolica',
  [VehicleEnum.SOLO_TRUCK]: 'Solo kamion',
  [VehicleEnum.VAN]: 'Kombi',
};

const sum = (periods: Period[], value: (period: Period) => number) =>
  periods.reduce((total, period) => total + value(period), 0);

const topByRevenue = (rows: RankingRow[]) => [...rows].sort((a, b) => b.revenue - a.revenue).slice(0, TOP_N);

interface ViewProps {
  filters: Filters;
  data: PeriodsData & { periods: Period[] };
  today: Date;
}

function useEntityRange(data: PeriodsData) {
  // The per-entity endpoints take only the range (as today): no entity filter, no granularity.
  const { from, to } = data.range;
  return React.useMemo(() => ({ from, to }), [from, to]);
}

// ---------------------------------------------------------------------------------------------------------------------
// Ukupno
// ---------------------------------------------------------------------------------------------------------------------

export function Overview({ filters, data, today }: ViewProps) {
  const { periods, count, price, before, dim } = data;
  const per = GRANULARITY.find((item) => item.key === filters.granularity)!.per;
  const countAll = (p: Period) => p.countRegular + p.countAgency;
  const revenueAll = (p: Period) => p.revenueRegular + p.revenueAgency;

  const range = useEntityRange(data);
  const clientsAnalytics = useClientsAnalytics(range);
  const { data: clients } = useClients();
  const clientRows = React.useMemo(() => {
    const names = new Map((clients ?? []).map((client) => [client.id, client.name]));
    return topByRevenue(
      (clientsAnalytics.data ?? []).map((item) => ({
        id: item.clientId,
        name: names.get(item.clientId) ?? '—',
        href: `/dashboard/clients/${item.clientId}`,
        count: item.shipmentCount,
        revenue: item.totalPrice,
      }))
    );
  }, [clients, clientsAnalytics.data]);

  const agencyCount = count?.totalAgency ?? sum(periods, (p) => p.countAgency);
  const totalCount = count ? count.totalRegular + count.totalAgency : sum(periods, countAll);
  const totalRevenue = price ? price.totalRevenueRegular + price.totalRevenueAgency : sum(periods, revenueAll);
  const averageCount = count ? count.averageRegular + count.averageAgency : 0;
  const averageRevenue = price ? price.averageRevenueRegular + price.averageRevenueAgency : 0;

  return (
    <div className="flex flex-col gap-4">
      <StatTilesGrid dim={dim}>
        <StatTile
          delta={
            before && (
              <Delta
                before={before.count && before.count.totalRegular + before.count.totalAgency}
                now={totalCount}
                range={before.label}
              />
            )
          }
          label="Nalozi"
          note={`od toga ${int(agencyCount)} ${plural(agencyCount, ['agencijski', 'agencijska', 'agencijskih'])}`}
          value={int(totalCount)}
        />
        <StatTile
          delta={
            before && (
              <Delta
                before={before.count && before.count.averageRegular + before.count.averageAgency}
                now={averageCount}
                range={before.label}
              />
            )
          }
          label={`Nalozi ${per}, prosjek`}
          value={int(averageCount)}
        />
        <StatTile
          delta={
            before && (
              <Delta
                before={before.price && before.price.totalRevenueRegular + before.price.totalRevenueAgency}
                now={totalRevenue}
                range={before.label}
              />
            )
          }
          label="Prihod"
          note={`od toga ${eur(price?.totalRevenueAgency ?? 0)} agencijski`}
          value={eur(totalRevenue)}
        />
        <StatTile
          delta={
            before && (
              <Delta
                before={before.price && before.price.averageRevenueRegular + before.price.averageRevenueAgency}
                now={averageRevenue}
                range={before.label}
              />
            )
          }
          label={`Prihod ${per}, prosjek`}
          value={eur(averageRevenue)}
        />
      </StatTilesGrid>
      <div className="grid gap-4 2xl:grid-cols-2">
        <ChartCard
          dim={dim}
          periods={periods}
          series={[
            { key: 'countRegular', value: (p) => p.countRegular, format: int, mark: 'bar' },
            { key: 'countAgency', value: (p) => p.countAgency, format: int, mark: 'bar' },
          ]}
          stacked
          title="Nalozi"
          today={today}
        />
        <ChartCard
          dim={dim}
          periods={periods}
          series={[
            { key: 'revenueRegular', value: (p) => p.revenueRegular, format: eur, mark: 'bar' },
            { key: 'revenueAgency', value: (p) => p.revenueAgency, format: eur, mark: 'bar' },
          ]}
          stacked
          title="Prihod"
          today={today}
        />
      </div>
      <RankingTable
        dim={dim}
        entity="Klijent"
        isLoading={!clientsAnalytics.data}
        rows={clientRows}
        title="Klijenti"
        onRetry={retryOnError(clientsAnalytics)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Vlastiti prijevoz
// ---------------------------------------------------------------------------------------------------------------------

export function Regular({ filters, data, today }: ViewProps) {
  const { periods, count, price, before, dim } = data;
  const per = GRANULARITY.find((item) => item.key === filters.granularity)!.per;

  const range = useEntityRange(data);
  const driversAnalytics = useDriversAnalytics(range);
  const vehiclesAnalytics = useVehiclesAnalytics(range);
  const { data: employees } = useEmployees({ includeDeleted: true });
  const { data: vehicles } = useVehicles();

  const driverRows = React.useMemo(() => {
    const names = new Map((employees ?? []).map((employee) => [employee.id, employee.fullName]));
    return topByRevenue(
      (driversAnalytics.data ?? []).map((item) => ({
        id: item.driverId,
        name: names.get(item.driverId) ?? '—',
        href: `/dashboard/employees/${item.driverId}`,
        count: item.shipmentCount,
        revenue: item.totalPrice,
      }))
    );
  }, [employees, driversAnalytics.data]);

  const vehicleRows = React.useMemo(() => {
    const byId = new Map((vehicles ?? []).map((vehicle) => [vehicle.id, vehicle]));
    return topByRevenue(
      (vehiclesAnalytics.data ?? []).map((item) => {
        const vehicle = byId.get(item.vehicleId);
        return {
          id: item.vehicleId,
          name: vehicle?.registration ?? '—',
          detail: vehicle ? [vehicle.brand, VEHICLE_TYPE_LABEL[vehicle.type]].filter(Boolean).join(' · ') : undefined,
          href: vehicle ? vehicleHref(vehicle.id) : undefined,
          count: item.shipmentCount,
          revenue: item.totalPrice,
        };
      })
    );
  }, [vehicles, vehiclesAnalytics.data]);

  const totalCount = count?.totalRegular ?? sum(periods, (p) => p.countRegular);
  const totalRevenue = price?.totalRevenueRegular ?? sum(periods, (p) => p.revenueRegular);

  return (
    <div className="flex flex-col gap-4">
      <StatTilesGrid dim={dim}>
        <StatTile
          delta={before && <Delta before={before.count?.totalRegular} now={totalCount} range={before.label} />}
          label="Nalozi"
          value={int(totalCount)}
        />
        <StatTile label={`Nalozi ${per}, prosjek`} value={int(count?.averageRegular ?? 0)} />
        <StatTile
          delta={before && <Delta before={before.price?.totalRevenueRegular} now={totalRevenue} range={before.label} />}
          label="Prihod"
          value={eur(totalRevenue)}
        />
        <StatTile label="Prihod po nalogu" value={eur(totalRevenue / Math.max(1, totalCount))} />
      </StatTilesGrid>
      <div className="grid gap-4 2xl:grid-cols-2">
        <ChartCard
          dim={dim}
          periods={periods}
          series={[{ key: 'countRegular', value: (p) => p.countRegular, format: int, mark: 'bar' }]}
          subtitle="Vlastiti prijevoz"
          title="Nalozi"
          today={today}
        />
        <ChartCard
          dim={dim}
          periods={periods}
          series={[{ key: 'revenueRegular', value: (p) => p.revenueRegular, format: eur, mark: 'bar' }]}
          subtitle="Vlastiti prijevoz"
          title="Prihod"
          today={today}
        />
      </div>
      <div className="grid items-start gap-4 xl:grid-cols-2">
        <RankingTable
          dim={dim}
          entity="Vozač"
          isLoading={!driversAnalytics.data}
          rows={driverRows}
          title="Vozači"
          onRetry={retryOnError(driversAnalytics)}
        />
        <RankingTable
          dim={dim}
          entity="Vozilo"
          isLoading={!vehiclesAnalytics.data}
          mono
          rows={vehicleRows}
          title="Vozila"
          onRetry={retryOnError(vehiclesAnalytics)}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Agencijski nalozi
// ---------------------------------------------------------------------------------------------------------------------

export function Agency({ data, today }: ViewProps) {
  const { periods, count, price, before, dim } = data;
  const margin = (p: Period) => p.revenueAgency - p.costAgency;

  const range = useEntityRange(data);
  const contractorsAnalytics = useTransportContractorsAnalytics(range);
  const { data: contractors } = useContractors();
  const contractorRows = React.useMemo(() => {
    const names = new Map((contractors ?? []).map((contractor) => [contractor.id, contractor.name]));
    return (contractorsAnalytics.data ?? []).map((item) => ({
      id: item.contractorId,
      name: names.get(item.contractorId) ?? '—',
      href: `/dashboard/contractors/${item.contractorId}`,
      count: item.shipmentCount,
      revenue: item.totalRevenue,
      cost: item.totalCost,
      margin: item.margin,
    }));
  }, [contractors, contractorsAnalytics.data]);

  const totalCount = count?.totalAgency ?? sum(periods, (p) => p.countAgency);
  const revenue = price?.totalRevenueAgency ?? sum(periods, (p) => p.revenueAgency);
  const cost = price?.totalCostAgency ?? sum(periods, (p) => p.costAgency);
  const ruc = revenue - cost;
  const rucBefore = before?.price && before.price.totalRevenueAgency - before.price.totalCostAgency;

  return (
    <div className="flex flex-col gap-4">
      <StatTilesGrid dim={dim}>
        <StatTile
          delta={before && <Delta before={before.count?.totalAgency} now={totalCount} range={before.label} />}
          label="Agencijski nalozi"
          value={int(totalCount)}
        />
        <StatTile
          delta={before && <Delta before={before.price?.totalRevenueAgency} now={revenue} range={before.label} />}
          label="Prihod"
          value={eur(revenue)}
        />
        <StatTile
          delta={
            before && <Delta before={before.price?.totalCostAgency} now={cost} range={before.label} upIsGood={false} />
          }
          label="Trošak"
          value={eur(cost)}
        />
        <StatTile
          delta={before && <Delta before={rucBefore} now={ruc} range={before.label} />}
          label="RUC"
          note={revenue ? `Marža ${percent((ruc / revenue) * 100)}` : undefined}
          value={eur(ruc)}
        />
      </StatTilesGrid>
      <div className="grid gap-4 2xl:grid-cols-2">
        <ChartCard
          dim={dim}
          periods={periods}
          series={[
            { key: 'revenueAgencyLine', value: (p) => p.revenueAgency, format: eur, mark: 'line' },
            { key: 'costAgency', value: (p) => p.costAgency, format: eur, mark: 'line' },
          ]}
          title="Prihod i trošak"
          today={today}
        />
        <ChartCard
          dim={dim}
          periods={periods}
          series={[{ key: 'margin', value: margin, format: eur, mark: 'bar', signed: true }]}
          subtitle="Prihod − trošak; ispod nule = gubitak"
          title="RUC"
          today={today}
          zeroLine
        />
      </div>
      <ContractorsTable
        dim={dim}
        isLoading={!contractorsAnalytics.data}
        rows={contractorRows}
        onRetry={retryOnError(contractorsAnalytics)}
      />
    </div>
  );
}
