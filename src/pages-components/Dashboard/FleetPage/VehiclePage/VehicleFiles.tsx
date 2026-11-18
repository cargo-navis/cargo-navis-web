import * as React from 'react';

import { FileDeleteDialog, FileRow } from '@/components/shared/file-row';
import { Panel } from '@/components/shared/panel';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { Vehicle } from '@/lib/api';
import { useDeleteVehicleFile, useGetVehicleDocumentUrl, useUploadVehicleFile } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/date';
import { bytesToMegabytes, downloadVehicleFile, getFileInput } from '@/lib/utils/file';
import { getFileIcon } from '@/lib/utils/fileIcon';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

const FILE_SIZE_LIMIT_IN_MB = 10;

type VehicleDocument = NonNullable<Vehicle['documents']>[number];

/**
 * Datoteke (lab /fleet, DECISIONS §2 „File rows”): row click = preview (today's: inline in a new tab), ⬇ / 🗑 on hover
 * or focus, delete confirms. „Dodaj” or drop files on the panel; nothing yet = a dashed drop area. Today's calls.
 */
export function VehicleFiles({ vehicle }: { vehicle: Vehicle }) {
  const [toDelete, setToDelete] = React.useState<VehicleDocument | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadVehicleFile(vehicle.id);
  const { mutateAsync: deleteFile, isPending: isDeleting } = useDeleteVehicleFile(vehicle.id);
  const { mutateAsync: getDocumentUrl } = useGetVehicleDocumentUrl(vehicle.id);
  const documents = vehicle.documents ?? [];

  async function upload(files: FileList | File[] | null) {
    const list = files ? Array.from(files) : [];
    if (list.length === 0) return;

    let uploaded = 0;
    let skipped = 0;
    for (const file of list) {
      if (bytesToMegabytes(file.size) > FILE_SIZE_LIMIT_IN_MB) {
        skipped++;
        continue;
      }
      try {
        await uploadFile({ file, fileName: file.name });
        uploaded++;
      } catch {
        // One failed file doesn't stop the rest.
      }
    }

    if (skipped > 0) {
      showErrorToast({
        title: `Preskočeno: ${skipped} od ${list.length}`,
        description: `Datoteka može imati najviše ${FILE_SIZE_LIMIT_IN_MB} MB.`,
      });
    }
    if (uploaded > 0) {
      showSuccessToast({
        title: list.length === 1 ? 'Datoteka dodana' : `Dodano ${uploaded} od ${list.length}`,
        description: list.length === 1 ? list[0].name : undefined,
      });
    }
    if (uploaded === 0 && skipped === 0) {
      showErrorToast({ title: 'Datoteke nisu dodane. Pokušajte ponovno.' });
    }
  }

  const pick = () => getFileInput((files) => void upload(files), { multiple: true });

  async function preview(document: VehicleDocument) {
    try {
      const url = await getDocumentUrl({ documentId: document.id, disposition: 'inline' });
      window.open(url, '_blank');
    } catch {
      showErrorToast({ title: 'Dokument se ne može otvoriti. Pokušajte ponovno.' });
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteFile(toDelete.id);
      showSuccessToast({ title: 'Dokument izbrisan', description: toDelete.name });
      setToDelete(null);
    } catch {
      showErrorToast({ title: 'Dokument nije izbrisan. Pokušajte ponovno.' });
    }
  }

  const dropProps = {
    onDragOver: (event: React.DragEvent) => {
      if (!event.dataTransfer.types.includes('Files')) return;
      event.preventDefault();
      setDragging(true);
    },
    onDragLeave: (event: React.DragEvent) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
    },
    onDrop: (event: React.DragEvent) => {
      event.preventDefault();
      setDragging(false);
      void upload(event.dataTransfer.files);
    },
  };

  return (
    <Panel
      action={
        <Button loading={isUploading} size="sm" variant="ghost" onClick={pick}>
          <Icon data-icon="inline-start" icon="IconUpload" size="s" /> Dodaj
        </Button>
      }
      bodyClassName="p-2"
      title="Datoteke"
    >
      <div {...dropProps} className={cn('rounded-lg', dragging && 'bg-primary/5 ring-2 ring-primary/40')}>
        {documents.length === 0 ? (
          <button
            className="flex w-full flex-col items-center gap-1 rounded-lg border border-dashed px-3 py-5 text-center text-sm text-muted-foreground hover:bg-muted/50"
            disabled={isUploading}
            type="button"
            onClick={pick}
          >
            {isUploading ? <Spinner className="size-5" /> : <Icon icon="IconUpload" size="m" />}
            Povuci datoteke ovdje (prometna, polica osiguranja, leasing…)
          </button>
        ) : (
          documents.map((document) => (
            <FileRow
              date={document.createdAt ? formatDate(document.createdAt) : undefined}
              icon={getFileIcon(document)}
              key={document.id}
              name={document.name}
              onDelete={() => setToDelete(document)}
              onDownload={() => void downloadVehicleFile(vehicle.id, document.id)}
              onOpen={() => void preview(document)}
            />
          ))
        )}
      </div>
      <FileDeleteDialog
        fileName={toDelete?.name ?? null}
        loading={isDeleting}
        onConfirm={() => void confirmDelete()}
        onOpenChange={(open) => !open && setToDelete(null)}
      />
    </Panel>
  );
}
