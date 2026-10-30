import type { AxiosError } from 'axios';
import { useState } from 'react';

import { type DriverStop, type DriverStopDocument, getDriverStopFileUrl } from '@/lib/api/driver';
import { useDeleteDriverStopFile, useDriverAccount, useUploadDriverStopFile } from '@/lib/hooks/api/driver';
import { getDataPointDateString } from '@/lib/utils/date';
import { bytesToMegabytes, getFileInput } from '@/lib/utils/file';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { BottomSheet, Box, Button, FlexLayout, Icon, Text } from '@/ui';

import { getDocumentIcon } from '../utils';
import { prepareUploadFile } from './prepareUploadFile';

const FILE_SIZE_LIMIT_IN_MB = 10;

export const StopDocuments: React.FC<{ stop: DriverStop }> = ({ stop }) => {
  const { data: account } = useDriverAccount({ enabled: true });
  const { mutateAsync: uploadFile } = useUploadDriverStopFile();
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteDriverStopFile();
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  // The document stays set while the sheet slides closed, so its name doesn't vanish mid-animation.
  const [documentToDelete, setDocumentToDelete] = useState<DriverStopDocument | null>(null);
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);

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
      showErrorToast({ title: `${skippedCount} datoteka preskočeno (maks. ${FILE_SIZE_LIMIT_IN_MB}MB)` });
    }
    if (successCount > 0) {
      showSuccessToast({
        title:
          successCount === 1 && list.length === 1
            ? 'Datoteka uploadana'
            : `Uploadano ${successCount}/${list.length} datoteka`,
      });
    }
    if (successCount === 0 && skippedCount === 0) {
      showErrorToast({ title: 'Greška prilikom uploadanja datoteka. Pokušajte ponovno.' });
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
        onSuccess: () => setIsDeleteSheetOpen(false),
        onError: (error) => {
          const isForbidden = (error as AxiosError).response?.status === 403;
          showErrorToast({
            title: isForbidden ? 'Možeš obrisati samo dokumente koje si ti dodao.' : 'Brisanje nije uspjelo.',
          });
        },
      }
    );
  }

  return (
    <FlexLayout className="flex-col gap-2">
      <Text color="text-color-3" variant="text-xxxs-medium">
        DOKUMENTI
      </Text>
      {stop.documents.map((document) => (
        <FlexLayout
          className="items-center gap-2 mb-2 rounded-m border border-dark-100 dark:border-light-850"
          key={document.id}
        >
          <FlexLayout
            as="button"
            className="min-h-[44px] min-w-0 grow items-center gap-2 py-2 pl-3 text-left"
            type="button"
            onClick={() => void handlePreview(document)}
          >
            <Icon
              className="shrink-0"
              color="text-dark-600 dark:text-light-300"
              icon={getDocumentIcon(document)}
              size="m"
            />
            <FlexLayout className="min-w-0 flex-col">
              <Text className="truncate" color="text-color-1" variant="text-xs-medium">
                {document.name}
              </Text>
              <Text color="text-color-3" variant="text-xxxs">
                {getDataPointDateString(document.createdAt)}
              </Text>
            </FlexLayout>
          </FlexLayout>
          {account && document.uploadedBy === account.id && (
            <FlexLayout
              aria-label="Obriši dokument"
              as="button"
              className="size-[44px] shrink-0 items-center justify-center"
              type="button"
              onClick={() => {
                setDocumentToDelete(document);
                setIsDeleteSheetOpen(true);
              }}
            >
              <Icon color="text-red-500" icon="IconTrash" size="m" />
            </FlexLayout>
          )}
        </FlexLayout>
      ))}
      <Button
        iconLeft="IconCamera"
        isFullWidth
        isLoading={!!uploadProgress}
        size="l"
        text="Dodaj dokument"
        variant="secondary"
        onClick={() => getFileInput(handleFiles, { accept: 'image/*,application/pdf', multiple: true })}
      />
      {uploadProgress && (
        <Text className="text-center" color="text-color-3" variant="text-xxs">
          Učitavanje {uploadProgress.current}/{uploadProgress.total}…
        </Text>
      )}
      <BottomSheet
        description={documentToDelete?.name}
        footer={
          <Box className="grid grid-cols-2 gap-3">
            <Button
              isDisabled={isDeleting}
              isFullWidth
              size="l"
              text="Odustani"
              variant="secondary"
              onClick={() => setIsDeleteSheetOpen(false)}
            />
            <Button isFullWidth isLoading={isDeleting} size="l" text="Obriši" variant="danger" onClick={handleDelete} />
          </Box>
        }
        isNested
        isOpen={isDeleteSheetOpen}
        title="Obrisati dokument?"
        onOpenChange={setIsDeleteSheetOpen}
      />
    </FlexLayout>
  );
};
