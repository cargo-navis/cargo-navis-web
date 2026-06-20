import type { Shipment } from './shipments.d';

export type ShipmentDraftStatus = 'PENDING_EXTRACTION' | 'PROCESSING' | 'EXTRACTED' | 'CONFIRMED' | 'FAILED';

export type ShipmentDraftSource = 'EMAIL' | 'MANUAL_UPLOAD';

export type AiExtractedShipmentData = Partial<Shipment> & {
  /** Raw text extracted from the uploaded document by the AI pipeline. */
  extractedText?: string;
};

export interface ShipmentDraftDocument {
  id: string;
  createdAt: string;
  name: string;
  mimeType: string;
  status: string;
  publicUrl: string | null;
}

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
  document: ShipmentDraftDocument | null;
}

export interface CreateShipmentDraftParams {
  file: File;
  fileName?: string;
}
