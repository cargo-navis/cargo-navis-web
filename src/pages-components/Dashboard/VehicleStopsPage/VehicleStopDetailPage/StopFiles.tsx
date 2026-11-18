import * as React from 'react';

import { FileDeleteDialog, FileRow } from '@/components/shared/file-row';
import { Button } from '@/components/ui/button';
import type { VehicleStop, VehicleStopDocument } from '@/lib/api/vehicleStops';
import { useDeleteVehicleStopFile, useGetVehicleStopFileUrl, useUploadVehicleStopFile } from '@/lib/hooks';
import { formatDateShort } from '@/lib/utils/date';
import { bytesToMegabytes, downloadVehicleStopFile } from '@/lib/utils/file';
import { getFileIcon } from '@/lib/utils/fileIcon';
import { plural } from '@/lib/utils/plural';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

const FILE_SIZE_LIMIT_MB = 10;

/** Upload one or more files to a stop (today's FileUploadButton rules: 10 MB each, one toast for the batch). */
export function useStopFileUpload(stopId: string) {
  const { mutateAsync: upload, isPending } = useUploadVehicleStopFile(stopId);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    let uploaded = 0;
    let skipped = 0;
    for (const file of Array.from(files)) {
      if (bytesToMegabytes(file.size) > FILE_SIZE_LIMIT_MB) {
        skipped++;
        continue;
      }
      try {
        await upload({ file, fileName: file.name });
        uploaded++;
      } catch {
        // one failure doesn't stop the others
      }
    }
    if (skipped > 0) showErrorToast({ title: `Preskočeno: ${skipped} (najviše ${FILE_SIZE_LIMIT_MB} MB po datoteci)` });
    if (uploaded > 0) {
      showSuccessToast({
        title:
          files.length === 1
            ? 'Dokument dodan'
            : `Dodano ${uploaded} od ${files.length} ${plural(files.length, ['dokumenta', 'dokumenta', 'dokumenata'])}`,
      });
    }
    if (uploaded === 0 && skipped === 0) showErrorToast({ title: 'Dokument nije dodan. Pokušajte ponovno.' });
  }

  const input = (
    <input
      className="hidden"
      multiple
      ref={inputRef}
      type="file"
      onChange={(event) => {
        void uploadFiles(event.target.files);
        event.target.value = '';
      }}
    />
  );

  return { input, isUploading: isPending, pick: () => inputRef.current?.click() };
}

/** The stop's documents as file rows (DECISIONS §2: click = preview, ⬇ / 🗑 on hover, delete confirms). */
export function StopFiles({ stop, onAdd, isUploading }: { stop: VehicleStop; onAdd(): void; isUploading: boolean }) {
  const { mutateAsync: getUrl } = useGetVehicleStopFileUrl();
  const { mutateAsync: deleteFile, isPending: isDeleting } = useDeleteVehicleStopFile();
  const [toDelete, setToDelete] = React.useState<VehicleStopDocument | null>(null);

  async function preview(document: VehicleStopDocument) {
    try {
      window.open(await getUrl({ stopId: stop.id, documentId: document.id, disposition: 'inline' }), '_blank');
    } catch {
      showErrorToast({ title: 'Dokument se ne može otvoriti. Pokušajte ponovno.' });
    }
  }

  async function remove() {
    if (!toDelete) return;
    try {
      await deleteFile({ stopId: stop.id, documentId: toDelete.id });
      showSuccessToast({ title: 'Dokument izbrisan' });
      setToDelete(null);
    } catch {
      showErrorToast({ title: 'Dokument nije izbrisan. Pokušajte ponovno.' });
    }
  }

  return (
    <div className="flex flex-col gap-0.5 rounded-lg border p-1">
      {stop.documents.map((document) => (
        <FileRow
          date={formatDateShort(document.createdAt)}
          icon={getFileIcon(document)}
          key={document.id}
          name={document.name}
          onDelete={() => setToDelete(document)}
          onDownload={() => void downloadVehicleStopFile(stop.id, document.id)}
          onOpen={() => void preview(document)}
        />
      ))}
      <Button className="w-fit" loading={isUploading} size="sm" variant="ghost" onClick={onAdd}>
        <Icon data-icon="inline-start" icon="IconPlus" size="s" />
        Dodaj dokument
      </Button>
      <FileDeleteDialog
        fileName={toDelete?.name ?? null}
        loading={isDeleting}
        onConfirm={() => void remove()}
        onOpenChange={(open) => !open && setToDelete(null)}
      />
    </div>
  );
}
