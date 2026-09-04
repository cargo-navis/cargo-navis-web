import { InvoiceStatus } from './shipments';
import type { ShipmentCargoData } from './shipments.d';

/**
 * Creates the incoming (parent) and outgoing (child) shipment in one call.
 * Fields without the `contractor` prefix describe the parent — the order the
 * tenant takes from its client; the prefixed ones describe the child — the
 * order the tenant passes on to the external carrier.
 */
export interface CreateAgencyShipmentData {
  externalOrderReference: string;
  clientId: string;
  price: number;
  internalNote?: string;
  externalNote?: string;
  /** Invoice towards the client (parent). */
  invoiceStatus?: InvoiceStatus;
  /**
   * On PATCH the list is authoritative: an item with an `id` is updated, an
   * item without one is created, and any cargo missing from the list is
   * deleted. Omitting the key entirely leaves cargo untouched.
   */
  cargo: ShipmentCargoData[];
  /** External carrier the order is forwarded to. */
  transportContractorId: string;
  contractorPrice: number;
  contractorExternalOrderReference?: string;
  /** Links the shipment back to the AI-extracted draft it was confirmed from. */
  draftId?: string;
}

/** Partial update — send only the fields that change. */
export type UpdateAgencyShipmentData = Partial<CreateAgencyShipmentData> & {
  /** Invoice towards the carrier (child). */
  contractorInvoiceStatus?: InvoiceStatus;
};

/** Body for turning an existing regular shipment into an agency one. */
export interface ConvertToAgencyData {
  transportContractorId: string;
  contractorPrice: number;
  contractorExternalOrderReference?: string;
}
