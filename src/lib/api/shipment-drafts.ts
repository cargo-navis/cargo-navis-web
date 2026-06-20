import { backend } from '@/lib/services/backendService';

import type { CreateShipmentDraftParams, ShipmentDraft } from './shipment-drafts.d';

export async function getShipmentDrafts() {
  return backend.get<ShipmentDraft[]>('/api/shipment-drafts');
}

export async function getShipmentDraft(id: string) {
  return backend.get<ShipmentDraft>(`/api/shipment-drafts/${id}`);
}

export async function createShipmentDraft({ file, fileName }: CreateShipmentDraftParams) {
  const formData = new FormData();
  formData.append('file', file);
  if (fileName) {
    formData.append('filename', fileName);
  }

  return backend.post<ShipmentDraft>('/api/shipment-drafts', formData);
}

export async function deleteShipmentDraft(id: string) {
  return backend.delete<void>(`/api/shipment-drafts/${id}`);
}

export async function getShipmentDraftDocumentUrl(
  draftId: string,
  documentId: string,
  disposition: 'inline' | 'attachment' = 'attachment'
) {
  return backend.get<string>(`/api/shipment-drafts/${draftId}/files/${documentId}`, { params: { disposition } });
}
