/**
 * Dokumenti (lab /order DocumentsPanel + DECISIONS §2 file rows): the nalog's files and the ones added on its stops
 * (e.g. a driver's CMR photo), each through the endpoints of where it was uploaded. Row click = open inline in a new tab
 * (today's preview), ⬇ / 🗑 on hover (both on touch), delete confirms. „Dodaj” or drop files here → the nalog.
 */

import * as React from 'react';

import { FileDeleteDialog, FileRow } from '@/components/shared/file-row';
import { Panel } from '@/components/shared/panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Shipment } from '@/lib/api';
import {
  useDeleteShipmentFile,
  useDeleteVehicleStopFile,
  useGetShipmentDocumentUrl,
  useGetVehicleStopFileUrl,
  useUploadShipmentFile,
} from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/lib/utils/date';
import { downloadShipmentFile, downloadVehicleStopFile } from '@/lib/utils/file';
import { getFileIcon } from '@/lib/utils/fileIcon';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

import { uploadFiles as uploadWithLimit } from '../shared/upload';

interface DocumentItem {
  id: string;
  name: string;
  mimeType: string;
  createdAt: string;
  /** Set for files added on a stop. */
  stopId?: string;
  /** „Zagreb” for stop files. */
  place?: string | null;
}

export function documentsOf(shipment: Shipment): DocumentItem[] {
  return [
    ...(shipment.documents ?? []).map((document) => ({ ...document })),
    ...(shipment.vehicleStops ?? []).flatMap((stop) =>
      (stop.documents ?? []).map((document) => ({ ...document, stopId: stop.id, place: stop.address?.placeName }))
    ),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function DocumentsTab({ shipment }: { shipment: Shipment }) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<DocumentItem | null>(null);

  const { mutateAsync: upload, isPending: isUploading } = useUploadShipmentFile(shipment.id, shipment.isAgency);
  const { mutateAsync: getShipmentUrl } = useGetShipmentDocumentUrl(shipment.id, shipment.isAgency);
  const { mutateAsync: getStopUrl } = useGetVehicleStopFileUrl();
  const { mutateAsync: deleteShipmentFile, isPending: isDeletingShipmentFile } = useDeleteShipmentFile(
    shipment.id,
    shipment.isAgency
  );
  const { mutateAsync: deleteStopFile, isPending: isDeletingStopFile } = useDeleteVehicleStopFile();

  const documents = documentsOf(shipment);

  async function uploadFiles(files: File[]) {
    await uploadWithLimit(files, (file) => upload({ file, fileName: file.name }));
  }

  async function open(document: DocumentItem) {
    try {
      const url = document.stopId
        ? await getStopUrl({ stopId: document.stopId, documentId: document.id, disposition: 'inline' })
        : await getShipmentUrl({ documentId: document.id, disposition: 'inline' });
      window.open(url, '_blank');
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Dokument se nije otvorio', description: 'Pokušaj ponovno.' });
    }
  }

  function download(document: DocumentItem) {
    const request = document.stopId
      ? downloadVehicleStopFile(document.stopId, document.id)
      : downloadShipmentFile(shipment.id, document.id, shipment.isAgency);
    request.catch((error) => {
      console.error(error);
      showErrorToast({ title: 'Dokument se nije preuzeo', description: 'Pokušaj ponovno.' });
    });
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      if (toDelete.stopId) await deleteStopFile({ stopId: toDelete.stopId, documentId: toDelete.id });
      else await deleteShipmentFile(toDelete.id);
      showSuccessToast({ title: 'Dokument obrisan', description: toDelete.name });
      setToDelete(null);
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Dokument nije obrisan', description: 'Pokušaj ponovno.' });
    }
  }

  return (
    <Panel
      action={
        <Button loading={isUploading} size="sm" variant="ghost" onClick={() => fileInputRef.current?.click()}>
          <Icon data-icon="inline-start" icon="IconUpload" size="s" /> Dodaj
        </Button>
      }
      bodyClassName="p-2"
      title={
        <span className="flex items-center gap-2">
          Dokumenti <Badge size="sm">{documents.length}</Badge>
        </span>
      }
    >
      <input
        className="hidden"
        multiple
        ref={fileInputRef}
        type="file"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = '';
          void uploadFiles(files);
        }}
      />
      <div
        className={cn('rounded-lg', isDragging && 'bg-primary/5 ring-2 ring-primary/40')}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsDragging(false);
          void uploadFiles(Array.from(event.dataTransfer.files));
        }}
      >
        {documents.length === 0 ? (
          <button
            className="flex w-full flex-col items-center gap-1 rounded-lg border border-dashed px-3 py-5 text-center text-sm text-muted-foreground hover:bg-muted/40"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon icon="IconUpload" size="m" />
            <span>
              Povuci datoteke ovdje ili <span className="font-medium text-foreground">odaberi</span>
            </span>
          </button>
        ) : (
          <ul className="flex flex-col">
            {documents.map((document) => (
              <li key={`${document.stopId ?? 'nalog'}-${document.id}`}>
                <FileRow
                  date={[document.place, formatDateShort(document.createdAt)].filter(Boolean).join(' · ')}
                  icon={getFileIcon(document)}
                  name={document.name}
                  onDelete={() => setToDelete(document)}
                  onDownload={() => download(document)}
                  onOpen={() => void open(document)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      <FileDeleteDialog
        fileName={toDelete?.name ?? null}
        loading={isDeletingShipmentFile || isDeletingStopFile}
        onConfirm={() => void confirmDelete()}
        onOpenChange={(next) => !next && setToDelete(null)}
      />
    </Panel>
  );
}
