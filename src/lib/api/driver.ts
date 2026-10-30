import { driverBackend } from '@/lib/services/driverBackendService';

import type { DriverStop, DriverStopDocument } from './driver.d';
import { toPushSubscriptionRequest } from './push-subscriptions';
import type { User } from './user.d';
import type { VehicleStop } from './vehicleStops.d';

export type { DriverCargoShipment, DriverShipment, DriverStop, DriverStopCargo, DriverStopDocument } from './driver.d';

/** How far back completed stops are returned (backend default is 7 as well). */
export const DRIVER_COMPLETED_WITHIN_DAYS = 7;

export async function getDriverAccount() {
  return driverBackend.get<User>('/api/account');
}

export async function getDriverStops() {
  return driverBackend.get<DriverStop[]>('/api/driver/stops', {
    params: { completedWithinDays: DRIVER_COMPLETED_WITHIN_DAYS },
  });
}

export async function completeDriverStop(stopId: string) {
  return driverBackend.post<VehicleStop>(`/api/vehicle-stops/${stopId}/complete`);
}

export async function uncompleteDriverStop(stopId: string) {
  return driverBackend.post<VehicleStop>(`/api/vehicle-stops/${stopId}/uncomplete`);
}

export async function uploadDriverStopFile(stopId: string, file: File, fileName?: string) {
  const formData = new FormData();
  formData.append('file', file);
  return driverBackend.post<DriverStopDocument>(`/api/vehicle-stops/${stopId}/files`, formData, {
    params: fileName ? { filename: fileName } : undefined,
  });
}

export async function getDriverStopFileUrl(
  stopId: string,
  documentId: string,
  disposition: 'inline' | 'attachment' = 'inline'
) {
  return driverBackend.get<string>(`/api/vehicle-stops/${stopId}/files/${documentId}`, { params: { disposition } });
}

export async function deleteDriverStopFile(stopId: string, documentId: string) {
  return driverBackend.delete<void>(`/api/vehicle-stops/${stopId}/files/${documentId}`);
}

export async function getDriverPushSubscriptions() {
  return driverBackend.get<{ endpoint: string }[]>('/api/push-subscriptions');
}

export async function createDriverPushSubscription(subscription: PushSubscription) {
  return driverBackend.post<void>('/api/push-subscriptions', toPushSubscriptionRequest(subscription));
}
