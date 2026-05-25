import dayjs from 'dayjs';

import type { VehicleStop } from '@/lib/api/vehicleStops';

export const isStopCompleted = (stop: VehicleStop) =>
  Boolean(stop.completedAt) && dayjs(stop.completedAt).isBefore(dayjs());
