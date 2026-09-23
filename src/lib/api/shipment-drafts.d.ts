import type { Shipment } from './shipments.d';
import type { ViesCompanyAddress } from './vies.d';

export type ShipmentDraftStatus = 'PENDING_EXTRACTION' | 'PROCESSING' | 'EXTRACTED' | 'CONFIRMED' | 'FAILED';

export type ShipmentDraftSource = 'EMAIL' | 'MANUAL_UPLOAD';

/**
 * A company the backend found in VIES but has no client for. It is returned
 * only when the extraction could not link the order to an existing client, and
 * carries whatever VIES gave the backend, so any part of it may be missing.
 */
export interface SuggestedNewClient {
  taxId: string;
  name?: string | null;
  address?: Partial<ViesCompanyAddress> | null;
}

export type AiExtractedShipmentData = Partial<Shipment> & {
  /** Raw text extracted from the uploaded document by the AI pipeline. */
  extractedText?: string;
  suggestedNewClient?: SuggestedNewClient | null;
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
  /** Mirrors `aiExtractedData.suggestedNewClient`; the backend may send either. */
  suggestedNewClient?: SuggestedNewClient | null;
}

export interface CreateShipmentDraftParams {
  file: File;
  fileName?: string;
}
