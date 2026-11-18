import type { AxiosError } from 'axios';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { type DriverStop, type DriverStopDocument, getDriverStopFileUrl } from '@/lib/api/driver';
import { useDeleteDriverStopFile, useDriverAccount, useUploadDriverStopFile } from '@/lib/hooks/api/driver';
import { formatDate } from '@/lib/utils/date';
import { bytesToMegabytes, getFileInput } from '@/lib/utils/file';
import { getFileIcon } from '@/lib/utils/fileIcon';
import { pluralCount } from '@/lib/utils/plural';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

import { keepOpenOnToastPress, SectionTitle } from '../ui';
import { prepareUploadFile } from './prepareUploadFile';

const FILE_SIZE_LIMIT_IN_MB = 10;
const SKIPPED = ['datoteka preskočena', 'datoteke preskočene', 'datoteka preskočeno'] as const;

interface StopDocumentsProps {
  stop: DriverStop;
  // On in the Nalozi tab: documents are added and deleted from the stop on the route, the order sheet only lists them
  isReadOnly?: boolean;
}

export const StopDocuments: React.FC<StopDocumentsProps> = ({ stop, isReadOnly = false }) => {
  const { data: account } = useDriverAccount({ enabled: true });
  const { mutateAsync: uploadFile } = useUploadDriverStopFile();
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteDriverStopFile();
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  // The document stays set while the drawer slides closed, so its name doesn't vanish mid-animation.
  const [documentToDelete, setDocumentToDelete] = useState<DriverStopDocument | null>(null);
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const list = Array.from(files);
    let successCount = 0;
    let skippedCount = 0;

    for (let index = 0; index < list.length; index++) {
      setUploadProgress({ current: index + 1, total: list.length });
      const file = await prepareUploadFile(list[index]);

      if (bytesToMegabytes(file.size) > FILE_SIZE_LIMIT_IN_MB) {
        skippedCount++;
        continue;
      }

      try {
        await uploadFile({ stopId: stop.id, file, fileName: file.name });
        successCount++;
      } catch {
        // individual failure — continue with remaining files
      }
    }

    setUploadProgress(null);

    if (skippedCount > 0) {
      showErrorToast({ title: `${pluralCount(skippedCount, SKIPPED)} (maks. ${FILE_SIZE_LIMIT_IN_MB} MB)` });
    }
    if (successCount > 0) {
      showSuccessToast({
        title:
          successCount === 1 && list.length === 1
            ? 'Datoteka učitana'
            : `Učitano ${successCount}/${list.length} datoteka`,
      });
    }
    if (successCount === 0 && skippedCount === 0) {
      showErrorToast({ title: 'Učitavanje datoteka nije uspjelo. Pokušaj ponovno.' });
    }
  }

  async function handlePreview(document: DriverStopDocument) {
    // Open the tab synchronously, inside the tap; iOS Safari blocks window.open after an await.
    const previewWindow = window.open('', '_blank');
    if (previewWindow) previewWindow.opener = null;

    try {
      const url = await getDriverStopFileUrl(stop.id, document.id);
      if (previewWindow) {
        previewWindow.location.href = url;
      } else {
        window.location.href = url;
      }
    } catch {
      previewWindow?.close();
      showErrorToast({ title: 'Greška prilikom otvaranja dokumenta' });
    }
  }

  function handleDelete() {
    if (!documentToDelete) return;

    deleteFile(
      { stopId: stop.id, documentId: documentToDelete.id },
      {
        onSuccess: () => setIsDeleteDrawerOpen(false),
        onError: (error) => {
          const isForbidden = (error as AxiosError).response?.status === 403;
          showErrorToast({
            title: isForbidden ? 'Možeš obrisati samo dokumente koje si ti dodao.' : 'Brisanje nije uspjelo.',
          });
        },
      }
    );
  }

  // Without the upload button an empty section would be just a heading
  if (isReadOnly && stop.documents.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <SectionTitle className="text-muted-foreground" icon="IconPaperclip">
        DOKUMENTI
      </SectionTitle>
      {stop.documents.length === 0 && <span className="text-sm text-muted-foreground">Još nema dokumenata.</span>}
      {stop.documents.map((document) => {
        const isMine = !!account && document.uploadedBy === account.id;
        return (
          <div className="flex items-center gap-1" key={document.id}>
            {/* Tap = open the document (today's preview: a new tab). */}
            <button
              className="flex min-h-12 min-w-0 grow items-center gap-3 text-left"
              type="button"
              onClick={() => void handlePreview(document)}
            >
              <Icon className="shrink-0 text-muted-foreground" icon={getFileIcon(document)} size="l" />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{document.name}</span>
                <span className="text-xs text-muted-foreground">
                  {isMine ? 'Ti' : 'Disponent'} · {formatDate(document.createdAt)}
                </span>
              </span>
            </button>
            {!isReadOnly && isMine && (
              <Button
                aria-label="Obriši dokument"
                className="text-destructive"
                size="icon-xl"
                variant="ghost"
                onClick={() => {
                  setDocumentToDelete(document);
                  setIsDeleteDrawerOpen(true);
                }}
              >
                <Icon icon="IconTrash" size="m" />
              </Button>
            )}
          </div>
        );
      })}
      {!isReadOnly && (
        <Button
          className="w-full"
          loading={!!uploadProgress}
          size="xl"
          variant="outline"
          onClick={() => getFileInput(handleFiles, { accept: 'image/*,application/pdf', multiple: true })}
        >
          <Icon data-icon="inline-start" icon="IconCamera" size="m" />
          {uploadProgress ? `Učitavanje ${uploadProgress.current}/${uploadProgress.total}…` : 'Dodaj dokument'}
        </Button>
      )}
      {/* Rendered inside the stop drawer, so Base UI stacks it on top as a nested drawer. */}
      <Drawer open={isDeleteDrawerOpen} onOpenChange={keepOpenOnToastPress(setIsDeleteDrawerOpen)}>
        <DrawerContent>
          <DrawerHeader className="not-last:border-b-0">
            <DrawerTitle>Obrisati dokument?</DrawerTitle>
            <DrawerDescription>{documentToDelete?.name}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="grid grid-cols-2 gap-3 pt-6 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <DrawerClose disabled={isDeleting} render={<Button className="w-full" size="xl" variant="ghost" />}>
              Odustani
            </DrawerClose>
            <Button className="w-full" loading={isDeleting} size="xl" variant="destructive" onClick={handleDelete}>
              Obriši
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
