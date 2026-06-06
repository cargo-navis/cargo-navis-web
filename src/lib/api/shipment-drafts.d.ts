import type { Shipment } from './shipments.d';

export type ShipmentDraftStatus = 'PENDING_EXTRACTION' | 'PROCESSING' | 'EXTRACTED' | 'CONFIRMED' | 'FAILED';

export type ShipmentDraftSource = 'EMAIL' | 'MANUAL_UPLOAD';

export type AiExtractedShipmentData = Shipment;

export interface ShipmentDraft {
  id: string;
  fileName: string;
  status: ShipmentDraftStatus;
  source: ShipmentDraftSource;
  shipmentId: string | null;
  aiExtractedData: AiExtractedShipmentData | null;
  changeRatio: number | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShipmentDraftParams {
  file: File;
  fileName?: string;
}
