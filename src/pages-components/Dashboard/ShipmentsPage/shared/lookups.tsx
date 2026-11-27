import * as React from 'react';

import type { Client, Contractor, Employee, Shipment, Vehicle } from '@/lib/api';
import { PositionEnum } from '@/lib/api/employees';
import { VehicleEnum } from '@/lib/api/vehicles';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { useClients, useContractors, useEmployees, useVehicles } from '@/lib/hooks';

/** Names behind the ids on a nalog (clients, contractors, vehicles, employees), loaded once per page. */
export interface ShipmentLookups {
  isLoading: boolean;
  clientsById: Map<string, Client>;
  contractorsById: Map<string, Contractor>;
  vehiclesById: Map<string, Vehicle>;
  /** Including deleted, so old nalozi still show their driver's name. */
  employeesById: Map<string, Employee>;
  /** Trucks, solo trucks and vans (what can be assigned to a nalog), by registration. */
  motorVehicles: Vehicle[];
  /** Active drivers, by name. */
  drivers: Employee[];
}

const byId = <T extends { id: string }>(items: T[] | undefined) =>
  new Map((items ?? []).map((item) => [item.id, item]));

export function useShipmentLookups(): ShipmentLookups {
  const { data: clients, isLoading: isClientsLoading } = useClients();
  const { data: contractors, isLoading: isContractorsLoading } = useContractors();
  const { data: vehicles, isLoading: isVehiclesLoading } = useVehicles();
  const { data: employees, isLoading: isEmployeesLoading } = useEmployees({ includeDeleted: true });

  return React.useMemo(
    () => ({
      isLoading: isClientsLoading || isContractorsLoading || isVehiclesLoading || isEmployeesLoading,
      clientsById: byId(clients),
      contractorsById: byId(contractors),
      vehiclesById: byId(vehicles),
      employeesById: byId(employees),
      motorVehicles: (vehicles ?? [])
        .filter((vehicle) => vehicle.type !== VehicleEnum.TRAILER)
        .sort((a, b) => (a.registration ?? '').localeCompare(b.registration ?? '')),
      drivers: (employees ?? [])
        .filter((employee) => !employee.deleted && employee.positions.includes(PositionEnum.Driver))
        .sort((a, b) => a.fullName.localeCompare(b.fullName)),
    }),
    [
      clients,
      contractors,
      vehicles,
      employees,
      isClientsLoading,
      isContractorsLoading,
      isVehiclesLoading,
      isEmployeesLoading,
    ]
  );
}

const LookupsContext = React.createContext<ShipmentLookups | null>(null);

export const ShipmentLookupsProvider = LookupsContext.Provider;

export function useLookups() {
  const context = React.useContext(LookupsContext);
  if (!context) throw new Error('useLookups must be used within a ShipmentLookupsProvider');
  return context;
}

/** The nalog's newest vehicle stop (today's list logic: the last in `vehicleStops`). */
export const getLatestStop = (shipment: Pick<Shipment, 'vehicleStops'>): VehicleStop | undefined =>
  shipment.vehicleStops?.[shipment.vehicleStops.length - 1];
