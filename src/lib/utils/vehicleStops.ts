import type { VehicleStop } from '@/lib/api/vehicleStops';

// A stop is completed as soon as the backend stamps `completedAt`.
export const isStopCompleted = (stop: VehicleStop) => Boolean(stop.completedAt);
