import { useEffect, useRef, useState } from 'react';

import { Icon } from '@/ui';

import { useUploadDraftFiles } from './hooks';

interface ShipmentsDropZoneProps {
  onFilesAccepted?: () => void;
}

function isFileDrag(event: DragEvent) {
  return !!event.dataTransfer?.types?.includes('Files');
}

/** Drop a PDF anywhere on the Nalozi page → a new nalog u pripremi. */
export const ShipmentsDropZone: React.FC<ShipmentsDropZoneProps> = ({ onFilesAccepted }) => {
  const uploadFiles = useUploadDraftFiles(onFilesAccepted);
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
      await uploadFiles(Array.from(event.dataTransfer?.files ?? []));
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
  }, [uploadFiles]);

  if (!isDragging) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center border-4 border-dashed border-primary bg-primary/10">
      <div className="flex flex-col items-center gap-3 rounded-xl bg-popover px-16 py-8 text-popover-foreground shadow-lg ring-1 ring-foreground/10">
        <Icon className="text-brand" icon="IconUpload" size="xxl" />
        <span className="font-heading text-lg font-bold tracking-tight">Pusti za učitavanje</span>
        <span className="text-xs text-muted-foreground">Samo PDF</span>
      </div>
    </div>
  );
};
