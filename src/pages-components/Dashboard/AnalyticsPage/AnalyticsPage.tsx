import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ClientAnalyticsItem, DriverAnalyticsItem, VehicleAnalyticsItem } from '@/lib/api';
import { PositionEnum } from '@/lib/api/employees.d';
import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import {
  useClient,
  useClientsAnalytics,
  useCurrentUser,
  useDriversAnalytics,
  useEmployee,
  useShipmentAnalytics,
  useShipmentPriceAnalytics,
  useVehicle,
  useVehiclesAnalytics,
} from '@/lib/hooks/api';
import { FlexLayout, Heading, Text } from '@/ui';

import { ClientFilter } from './ClientFilter';
import { ContentLoader } from './ContentLoader';
import { DateRangeFilter, DateRangeOption, getDateRange } from './DateRangeFilter';
import { DriverFilter } from './DriverFilter';
import { GranularityFilter, GranularityOption } from './GranularityFilter';
import { TotalAnalyticsSection } from './TotalAnalyticsSection';
import { VehicleFilter } from './VehicleFilter';

const TOP_N = 5;

export const AnalyticsPage = () => {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();

  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeOption>('last-6-months');
  const [selectedGranularity, setSelectedGranularity] = useState<GranularityOption>('month');
  const [selectedDriverId, setSelectedDriverId] = useState<string | undefined>(undefined);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(undefined);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);

  const isAuthorized = user?.positions?.some((p) => p === PositionEnum.Ceo || p === PositionEnum.Manager);

  useEffect(() => {
    if (!isUserLoading && user && !isAuthorized) {
      router.replace('/dashboard');
    }
  }, [isUserLoading, user, isAuthorized, router]);

  const handleDriverChange = (value: string | undefined) => {
    setSelectedDriverId(value);
    if (value) {
      setSelectedVehicleId(undefined);
    }
  };

  const handleVehicleChange = (value: string | undefined) => {
    setSelectedVehicleId(value);
    if (value) {
      setSelectedDriverId(undefined);
    }
  };

  const handleClientChange = (value: string | undefined) => {
    setSelectedClientId(value);
    if (value) {
      setSelectedVehicleId(undefined);
    }
  };

  // Compute date range based on selection
  const { from, to } = useMemo(() => getDateRange(selectedDateRange), [selectedDateRange]);

  // Common date range parameters
  const analyticsParams = {
    from,
    to,
    granularity: selectedGranularity,
    driverId: selectedDriverId,
    vehicleId: selectedVehicleId,
    clientId: selectedClientId,
  };

  const dateRangeParams = {
    from,
    to,
  };

  // Fetch analytics data
  const { data: countData, isLoading: isCountLoading } = useShipmentAnalytics(analyticsParams);
  const { data: priceData, isLoading: isPriceLoading } = useShipmentPriceAnalytics(analyticsParams);
  const { data: driversData, isLoading: isDriversLoading } = useDriversAnalytics(dateRangeParams);
  const { data: vehiclesData, isLoading: isVehiclesLoading } = useVehiclesAnalytics(dateRangeParams);
  const { data: clientsData, isLoading: isClientsLoading } = useClientsAnalytics(dateRangeParams);

  // Get top 5 drivers and vehicles
  const topDrivers = useMemo(() => {
    if (!driversData) return [];
    return [...driversData].sort((a, b) => b.shipmentCount - a.shipmentCount).slice(0, TOP_N);
  }, [driversData]);

  const topVehicles = useMemo(() => {
    if (!vehiclesData) return [];
    return [...vehiclesData].sort((a, b) => b.shipmentCount - a.shipmentCount).slice(0, TOP_N);
  }, [vehiclesData]);

  const topClients = useMemo(() => {
    if (!clientsData) return [];
    return [...clientsData].sort((a, b) => b.shipmentCount - a.shipmentCount).slice(0, TOP_N);
  }, [clientsData]);

  const isLoading = isCountLoading || isPriceLoading || isDriversLoading || isVehiclesLoading || isClientsLoading;
  const hasAllData = countData && priceData && driversData && vehiclesData;

  // Show loading state while checking authorization
  if (isUserLoading || !isAuthorized) {
    return (
      <DashboardLayout>
        <ClientSideOnly>
          <ContentLoader />
        </ClientSideOnly>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <FlexLayout className="flex-col gap-5">
        <FlexLayout className="flex-col gap-4">
          <Heading as="h1" variant="text-xl">
            Analitika
          </Heading>
          <FlexLayout className="gap-3">
            <DateRangeFilter value={selectedDateRange} onChange={setSelectedDateRange} />
            <GranularityFilter value={selectedGranularity} onChange={setSelectedGranularity} />
            <FlexLayout className="gap-3 items-center">
              <DriverFilter
                isDisabled={!!selectedVehicleId || !!selectedClientId}
                value={selectedDriverId}
                onChange={handleDriverChange}
              />
              <VehicleFilter
                isDisabled={!!selectedDriverId || !!selectedClientId}
                value={selectedVehicleId}
                onChange={handleVehicleChange}
              />
              <ClientFilter
                isDisabled={!!selectedVehicleId || !!selectedDriverId}
                value={selectedClientId}
                onChange={handleClientChange}
              />
            </FlexLayout>
          </FlexLayout>
        </FlexLayout>
        {isLoading || !hasAllData ? (
          <ClientSideOnly>
            <ContentLoader />
          </ClientSideOnly>
        ) : (
          <FlexLayout className="flex-col gap-5">
            <TotalAnalyticsSection countData={countData} granularity={selectedGranularity} priceData={priceData} />
            <FlexLayout className="w-full gap-5">
              <DriversTable data={topDrivers} />
              <VehiclesTable data={topVehicles} />
            </FlexLayout>
            <ClientsTable data={topClients} />
          </FlexLayout>
        )}
      </FlexLayout>
    </DashboardLayout>
  );
};

interface DriverRowProps {
  driver: DriverAnalyticsItem;
  index: number;
}

const DriverRow = ({ driver, index }: DriverRowProps) => {
  const { data: employee } = useEmployee(driver.driverId);
  const displayName = employee?.fullName || `${employee?.firstName} ${employee?.lastName}` || driver.driverId;

  return (
    <FlexLayout
      className={`w-full py-3 px-4 border-b border-b-black-alpha-10 dark:border-b-white-alpha-25 last:border-b-0 ${
        index % 2 === 0 ? 'bg-transparent' : 'bg-black-alpha-05 dark:bg-white-alpha-05'
      }`}
    >
      <Text className="flex-1" color="text-color-1" variant="text-s-medium">
        {displayName}
      </Text>
      <Text className="basis-[140px] text-right" color="text-color-1" variant="text-s">
        {driver.shipmentCount}
      </Text>
      <Text className="basis-[200px] text-right" color="text-color-1" variant="text-s">
        {driver.totalPrice.toLocaleString('hr-HR', { style: 'currency', currency: 'EUR' })}
      </Text>
    </FlexLayout>
  );
};

interface DriversTableProps {
  data: DriverAnalyticsItem[];
}

const DriversTable = ({ data }: DriversTableProps) => {
  return (
    <FlexLayout className="flex-1 flex-col gap-4 p-4 bg-white dark:bg-white-alpha-10 border border-dark-100 dark:border-light-900 shadow-sm rounded-m">
      <Text color="text-color-1" variant="text-xl-bold">
        Top {TOP_N} vozača
      </Text>

      {/* Table Header */}
      <FlexLayout className="w-full py-3 px-4 bg-dark-200 dark:bg-white-alpha-10 rounded-t-s">
        <Text className="flex-1" color="text-color-2" variant="text-s-medium">
          Vozač
        </Text>
        <Text className="basis-[140px] text-right" color="text-color-2" variant="text-s-medium">
          Br. naloga
        </Text>
        <Text className="basis-[200px] text-right" color="text-color-2" variant="text-s-medium">
          Ukupni prihod
        </Text>
      </FlexLayout>

      {/* Table Body */}
      <FlexLayout className="flex-col">
        {data.map((driver, index) => (
          <DriverRow driver={driver} index={index} key={driver.driverId} />
        ))}
      </FlexLayout>
    </FlexLayout>
  );
};

interface VehicleRowProps {
  vehicle: VehicleAnalyticsItem;
  index: number;
}

const VehicleRow = ({ index, vehicle }: VehicleRowProps) => {
  const { data: vehicleData } = useVehicle(vehicle.vehicleId);
  const displayName = vehicleData?.registration || vehicle.vehicleId;

  return (
    <FlexLayout
      className={`w-full py-3 px-4 border-b border-b-black-alpha-10 dark:border-b-white-alpha-25 last:border-b-0 ${
        index % 2 === 0 ? 'bg-transparent' : 'bg-black-alpha-05 dark:bg-white-alpha-05'
      }`}
    >
      <Text className="flex-1" color="text-color-1" variant="text-s-medium">
        {displayName}
      </Text>
      <Text className="basis-[140px] text-right" color="text-color-1" variant="text-s">
        {vehicle.shipmentCount}
      </Text>
      <Text className="basis-[200px] text-right" color="text-color-1" variant="text-s">
        {vehicle.totalPrice.toLocaleString('hr-HR', { style: 'currency', currency: 'EUR' })}
      </Text>
    </FlexLayout>
  );
};

interface VehiclesTableProps {
  data: VehicleAnalyticsItem[];
}

const VehiclesTable = ({ data }: VehiclesTableProps) => {
  return (
    <FlexLayout className="flex-1 flex-col gap-4 p-4 bg-white dark:bg-white-alpha-10 border border-dark-100 dark:border-light-900 shadow-md rounded-m">
      <Text color="text-color-1" variant="text-xl-bold">
        Top {TOP_N} vozila
      </Text>

      {/* Table Header */}
      <FlexLayout className="w-full py-3 px-4 bg-dark-200 dark:bg-white-alpha-10 rounded-t-s">
        <Text className="flex-1" color="text-color-2" variant="text-s-medium">
          Vozilo
        </Text>
        <Text className="basis-[140px] text-right" color="text-color-2" variant="text-s-medium">
          Br. naloga
        </Text>
        <Text className="basis-[200px] text-right" color="text-color-2" variant="text-s-medium">
          Ukupni prihod
        </Text>
      </FlexLayout>

      {/* Table Body */}
      <FlexLayout className="flex-col">
        {data.map((vehicle, index) => (
          <VehicleRow index={index} key={vehicle.vehicleId} vehicle={vehicle} />
        ))}
      </FlexLayout>
    </FlexLayout>
  );
};

interface ClientRowProps {
  client: ClientAnalyticsItem;
  index: number;
}

const ClientRow = ({ client, index }: ClientRowProps) => {
  const { data: clientData } = useClient(client.clientId);
  const displayName = clientData?.name || '—';

  return (
    <FlexLayout
      className={`w-full py-3 px-4 border-b border-b-black-alpha-10 dark:border-b-white-alpha-25 last:border-b-0 ${
        index % 2 === 0 ? 'bg-transparent' : 'bg-black-alpha-05 dark:bg-white-alpha-05'
      }`}
    >
      <Text className="flex-1" color="text-color-1" variant="text-s-medium">
        {displayName}
      </Text>
      <Text className="basis-[140px] text-right" color="text-color-1" variant="text-s">
        {client.shipmentCount}
      </Text>
      <Text className="basis-[200px] text-right" color="text-color-1" variant="text-s">
        {client.totalPrice.toLocaleString('hr-HR', { style: 'currency', currency: 'EUR' })}
      </Text>
    </FlexLayout>
  );
};

interface ClientsTableProps {
  data: ClientAnalyticsItem[];
}

const ClientsTable = ({ data }: ClientsTableProps) => {
  return (
    <FlexLayout className="flex-1 flex-col gap-4 p-4 bg-white dark:bg-white-alpha-10 border border-dark-100 dark:border-light-900 shadow-md rounded-m">
      <Text color="text-color-1" variant="text-xl-bold">
        Top {TOP_N} klijenata
      </Text>

      {/* Table Header */}
      <FlexLayout className="w-full py-3 px-4 bg-dark-200 dark:bg-white-alpha-10 rounded-t-s">
        <Text className="flex-1" color="text-color-2" variant="text-s-medium">
          Klijent
        </Text>
        <Text className="basis-[140px] text-right" color="text-color-2" variant="text-s-medium">
          Br. naloga
        </Text>
        <Text className="basis-[200px] text-right" color="text-color-2" variant="text-s-medium">
          Ukupni prihod
        </Text>
      </FlexLayout>

      {/* Table Body */}
      <FlexLayout className="flex-col">
        {data.map((client, index) => (
          <ClientRow client={client} index={index} key={client.clientId} />
        ))}
      </FlexLayout>
    </FlexLayout>
  );
};
