import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { generateShipmentPdf, type PaginatedResponse, type Shipment, type ShipmentPdfLanguage } from '@/lib/api';
import { InvoiceStatus } from '@/lib/api/shipments';
import { useDeleteAgencyShipment, useDeleteShipment, useUpdateAgencyShipment, useUpdateShipment } from '@/lib/hooks';
import { downloadBlob } from '@/lib/utils/file';
import { buildShipmentPdfFilename, SHIPMENT_PDF_LANGUAGES } from '@/lib/utils/shipments';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

import { INVOICE_STATUS_LABEL } from './invoice';

export const shipmentHref = (id: string) => `/dashboard/shipments/${id}`;
export const editShipmentHref = (id: string) => `/dashboard/shipments/${id}/edit`;
export const copyShipmentHref = (id: string) => `/dashboard/shipments/new?copyFromId=${id}`;
/** Dodijeli vozilo page; `created` = right after „Kreiraj nalog” (Korak 2 od 2). */
export const assignVehicleHref = (id: string, { created = false } = {}) =>
  `/dashboard/shipments/${id}/assign${created ? '?created=1' : ''}`;
export const NEW_SHIPMENT_HREF = '/dashboard/shipments/new';

export const PDF_LANGUAGES = SHIPMENT_PDF_LANGUAGES;

/**
 * Invoice status from a menu (row ⋯, Faktura „Promijeni ▾”); no confirm (DECISIONS §2: cheap). The row and the nalog
 * change at once (optimistic, rolled back on error); the update hooks then refetch the list.
 */
export function useChangeInvoiceStatus() {
  const queryClient = useQueryClient();
  const { mutateAsync: updateShipment, isPending: isUpdating } = useUpdateShipment();
  const { mutateAsync: updateAgencyShipment, isPending: isUpdatingAgency } = useUpdateAgencyShipment();

  const change = React.useCallback(
    async (shipment: Pick<Shipment, 'id' | 'isAgency' | 'invoiceStatus'>, invoiceStatus: InvoiceStatus) => {
      if (invoiceStatus === shipment.invoiceStatus) return;
      const patch = { invoiceStatus, invoiceStatusUpdatedAt: new Date().toISOString() };
      const listSnapshot = queryClient.getQueriesData<PaginatedResponse<Shipment>>({ queryKey: ['shipments'] });
      const detailSnapshot = queryClient.getQueryData<Shipment>(['shipment', shipment.id]);
      queryClient.setQueriesData<PaginatedResponse<Shipment>>(
        { queryKey: ['shipments'] },
        (data) =>
          data && { ...data, data: data.data.map((row) => (row.id === shipment.id ? { ...row, ...patch } : row)) }
      );
      queryClient.setQueryData<Shipment>(['shipment', shipment.id], (data) => data && { ...data, ...patch });
      try {
        if (shipment.isAgency) await updateAgencyShipment({ id: shipment.id, invoiceStatus });
        else await updateShipment({ id: shipment.id, invoiceStatus });
        showSuccessToast({ title: `Status fakture: ${INVOICE_STATUS_LABEL[invoiceStatus]}` });
      } catch (error) {
        console.error(error);
        listSnapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
        queryClient.setQueryData(['shipment', shipment.id], detailSnapshot);
        showErrorToast({ title: 'Status fakture nije promijenjen. Pokušaj ponovno.' });
      }
    },
    [queryClient, updateShipment, updateAgencyShipment]
  );

  return { change, isPending: isUpdating || isUpdatingAgency };
}

export interface PdfDocument {
  /** „Nalog”, or for agency „Nalog za klijenta” / „Nalog za kontraktora”. */
  label: string;
  recipientName?: string;
  shipmentId: string;
  orderNumber: string;
}

/**
 * PDFs of a nalog (today's ShipmentActions): own = one; agency = for the client and, from the outgoing (child) order,
 * for the contractor.
 */
export function getPdfDocuments(
  shipment: Shipment,
  { clientName, contractorName }: { clientName?: string; contractorName?: string }
): PdfDocument[] {
  if (!shipment.isAgency) {
    return [{ label: 'Nalog', recipientName: clientName, shipmentId: shipment.id, orderNumber: shipment.orderNumber }];
  }
  return [
    {
      label: 'Nalog za klijenta',
      recipientName: clientName,
      shipmentId: shipment.id,
      orderNumber: shipment.orderNumber,
    },
    ...(shipment.childId
      ? [
          {
            label: 'Nalog za kontraktora',
            recipientName: contractorName,
            shipmentId: shipment.childId,
            orderNumber: shipment.contractorOrderNumber ?? '',
          },
        ]
      : []),
  ];
}

export function useDownloadShipmentPdf() {
  const [isDownloading, setIsDownloading] = React.useState(false);

  const download = React.useCallback(async (document: PdfDocument, language: ShipmentPdfLanguage) => {
    setIsDownloading(true);
    try {
      const blob = await generateShipmentPdf(document.shipmentId, language);
      downloadBlob(blob, buildShipmentPdfFilename({ ...document, language }));
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'PDF se nije preuzeo. Pokušaj ponovno.' });
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return { download, isDownloading };
}

/**
 * „Izbrisati nalog #2041?” (AlertDialog, replaces window.confirm). Mount it only while it's needed: it holds the delete
 * mutations of this one nalog.
 */
export function DeleteShipmentDialog({
  shipment,
  clientName,
  open,
  onOpenChange,
  onDeleted,
}: {
  shipment: Pick<Shipment, 'id' | 'isAgency' | 'orderNumber'>;
  clientName?: string;
  open: boolean;
  onOpenChange(open: boolean): void;
  onDeleted?(): void;
}) {
  const { mutateAsync: deleteRegular, isPending: isDeletingRegular } = useDeleteShipment(shipment.id);
  const { mutateAsync: deleteAgency, isPending: isDeletingAgency } = useDeleteAgencyShipment(shipment.id);
  const isDeleting = isDeletingRegular || isDeletingAgency;

  async function handleDelete() {
    try {
      if (shipment.isAgency) await deleteAgency();
      else await deleteRegular();
      showSuccessToast({ title: `Nalog #${shipment.orderNumber} izbrisan` });
      onOpenChange(false);
      onDeleted?.();
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Nalog nije izbrisan. Pokušaj ponovno.' });
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isDeleting && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Icon icon="IconTrash" size="m" />
          </AlertDialogMedia>
          <AlertDialogTitle>Izbrisati nalog #{shipment.orderNumber}?</AlertDialogTitle>
          <AlertDialogDescription>
            {[clientName, shipment.isAgency && 'agencijski nalog: briše se i nalog za kontraktora']
              .filter(Boolean)
              .join(' · ')}
            {clientName || shipment.isAgency ? '. ' : ''}Ovo se ne može poništiti.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Odustani</AlertDialogCancel>
          <AlertDialogAction loading={isDeleting} variant="destructive" onClick={() => void handleDelete()}>
            <Icon data-icon="inline-start" icon="IconTrash" size="s" /> Izbriši
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
