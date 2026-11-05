import type { Employee } from '@/lib/api/employees.d';
import type { VehicleStop } from '@/lib/api/vehicleStops';

/** The distinct drivers of some stops, in stop order. */
export function getStopDriverIds(stops: Pick<VehicleStop, 'driverId'>[]): string[] {
  return Array.from(new Set(stops.map((stop) => stop.driverId).filter((id): id is string => !!id)));
}

/** Full names of these employees, skipping ones not (yet) loaded. */
export function getEmployeeNames(ids: string[], employees: Employee[] | undefined): string[] {
  return ids
    .map((id) => employees?.find((employee) => employee.id === id)?.fullName)
    .filter((name): name is string => !!name);
}

/**
 * Success toast after notifying a shipment's drivers, naming the ones actually notified (the backend skips stops it
 * couldn't deliver): `Vozač Ivan Horvat obaviješten o nalogu za Podravka d.d.`, or for several drivers the title
 * `Vozači obaviješteni o nalogu za …` with their names below.
 */
export function getDriversNotifiedToast({
  notifiedStops,
  employees,
  clientName,
  orderNumber,
}: {
  notifiedStops: VehicleStop[];
  employees: Employee[] | undefined;
  clientName: string | undefined;
  orderNumber: string;
}): { title: string; description?: string } {
  const order = clientName ? `o nalogu za ${clientName}.` : `o nalogu ${orderNumber}.`;
  const driverIds = getStopDriverIds(notifiedStops);
  const names = getEmployeeNames(driverIds, employees);

  if (driverIds.length > 1) {
    return { title: `Vozači obaviješteni ${order}`, description: names.join(', ') || undefined };
  }
  return { title: names[0] ? `Vozač ${names[0]} obaviješten ${order}` : `Vozač obaviješten ${order}` };
}
