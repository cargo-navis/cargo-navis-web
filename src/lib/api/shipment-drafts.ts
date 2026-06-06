import { backend } from '@/lib/services/backendService';

import type { CreateShipmentDraftParams, ShipmentDraft } from './shipment-drafts.d';

export async function getShipmentDrafts() {
  return backend.get<ShipmentDraft[]>('/api/shipment-drafts');
}

export async function getShipmentDraft(id: string) {
  const draft = await backend.get<ShipmentDraft>(`/api/shipment-drafts/${id}`);

  // TEMP: backend currently wraps every aiExtractedData field as
  // { candidates: [], bestGuess: <value> }. Flatten to the bestGuess so
  // the form can consume the draft like a plain Partial<Shipment>.
  // Remove once the API exposes candidates properly or settles on the
  // raw shape.
  return {
    ...draft,
    aiExtractedData: unwrapBestGuess(draft.aiExtractedData) as ShipmentDraft['aiExtractedData'],
  };
}

function unwrapBestGuess(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(unwrapBestGuess);
  }
  if (value !== null && typeof value === 'object') {
    if ('bestGuess' in value) {
      return unwrapBestGuess((value as { bestGuess: unknown }).bestGuess);
    }
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      result[key] = unwrapBestGuess(entry);
    }
    return result;
  }
  return value;
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
