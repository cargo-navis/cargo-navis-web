import type { AxiosResponse } from 'axios';

import { driverBackend } from '@/lib/services/driverBackendService';

import type { DriverShipment, DriverShipmentSummary, DriverStop, DriverStopDocument } from './driver.d';
import type { PaginatedResponse } from './pagination.d';
import { toPushSubscriptionRequest } from './push-subscriptions';
import type { User } from './user.d';
import type { VehicleStop } from './vehicleStops.d';

export type {
  DriverCargoShipment,
  DriverShipment,
  DriverShipmentSummary,
  DriverStop,
  DriverStopCargo,
  DriverStopDisponent,
  DriverStopDocument,
} from './driver.d';

export const DRIVER_PAGE_SIZE = 20;

export async function getDriverAccount() {
  return driverBackend.get<User>('/api/account');
}

async function getDriverPage<T>(url: string, page: number): Promise<PaginatedResponse<T>> {
  const response = await driverBackend.get<AxiosResponse<PaginatedResponse<T>>>(url, {
    params: { page, size: DRIVER_PAGE_SIZE },
    fullResponse: true,
  });
  return response.data;
}

/** The driver's stops, latest first: upcoming stops before completed ones. `page` starts at 1. */
export async function getDriverStops(page: number) {
  return getDriverPage<DriverStop>('/api/driver/stops', page);
}

/** The driver's orders, latest first. `page` starts at 1. */
export async function getDriverShipments(page: number) {
  return getDriverPage<DriverShipmentSummary>('/api/driver/shipments', page);
}

export async function getDriverShipment(shipmentId: string) {
  return driverBackend.get<DriverShipment>(`/api/driver/shipments/${shipmentId}`);
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
