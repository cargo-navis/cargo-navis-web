import { useEffect, useRef, useState } from 'react';

import { useCreateShipmentDraft } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, FlexLayout, Icon, Text } from '@/ui';

const ACCEPTED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/heic'];

interface ShipmentsDropZoneProps {
  onFilesAccepted?: () => void;
}

function isFileDrag(event: DragEvent) {
  return !!event.dataTransfer?.types?.includes('Files');
}

export const ShipmentsDropZone: React.FC<ShipmentsDropZoneProps> = ({ onFilesAccepted }) => {
  const { mutateAsync: createDraft } = useCreateShipmentDraft();
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    function handleDragEnter(event: DragEvent) {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      dragCounter.current += 1;
      if (dragCounter.current === 1) setIsDragging(true);
    }

    function handleDragOver(event: DragEvent) {
      if (!isFileDrag(event)) return;
      event.preventDefault();
    }

    function handleDragLeave(event: DragEvent) {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      dragCounter.current = Math.max(0, dragCounter.current - 1);
      if (dragCounter.current === 0) setIsDragging(false);
    }

    async function handleDrop(event: DragEvent) {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);

      const files = Array.from(event.dataTransfer?.files ?? []);
      const accepted = files.filter((file) => ACCEPTED_MIME_TYPES.includes(file.type));
      const rejectedCount = files.length - accepted.length;

      if (rejectedCount > 0) {
        showErrorToast({
          title: `${rejectedCount} ${rejectedCount === 1 ? 'datoteka nije podržana' : 'datoteke nisu podržane'}. Dozvoljeni su PDF i slike.`,
        });
      }

      if (accepted.length === 0) return;

      onFilesAccepted?.();

      const results = await Promise.allSettled(accepted.map((file) => createDraft({ file, fileName: file.name })));

      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.length - succeeded;

      if (succeeded > 0) {
        showSuccessToast({
          title: `${succeeded} ${succeeded === 1 ? 'nacrt učitan' : 'nacrta učitano'}. Obrada je u tijeku.`,
        });
      }
      if (failed > 0) {
        showErrorToast({
          title: `${failed} ${failed === 1 ? 'datoteku nije moguće učitati' : 'datoteke nije moguće učitati'}.`,
        });
      }
    }

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [createDraft, onFilesAccepted]);

  if (!isDragging) return null;

  return (
    <Box className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-teal-500/15 backdrop-blur-sm border-4 border-dashed border-teal-500">
      <FlexLayout className="flex-col items-center gap-3 bg-white/95 dark:bg-black/90 rounded-xl px-8 py-6 shadow-xl">
        <Icon color="text-teal-500" icon="IconUpload" size="xxl" />
        <Text variant="text-l-medium">Otpustite za upload</Text>
        <Text color="text-color-3" variant="text-xs">
          PDF ili slika
        </Text>
      </FlexLayout>
    </Box>
  );
};
