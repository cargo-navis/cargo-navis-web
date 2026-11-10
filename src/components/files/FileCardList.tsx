import { FileCard } from '@/lib/components/FileCard';
import { Box } from '@/ui';

import type { FileActions } from './useFileActions';

export interface FileCardListItem {
  document: {
    id: string;
    name: string;
    createdAt: string;
    mimeType: string;
    uploadedBy: string | null;
  };
  actions: FileActions;
}

export const FileCardList = ({ items }: { items: FileCardListItem[] }) => (
  <>
    {[...items]
      .sort((a, b) => a.document.createdAt.localeCompare(b.document.createdAt))
      .map(({ document, actions }) => (
        <Box className="max-w-[300px]" key={document.id}>
          <FileCard
            createdAt={document.createdAt}
            id={document.id}
            isLoading={actions.isLoading}
            mimeType={document.mimeType}
            name={document.name}
            shouldShowUploader
            uploadedBy={document.uploadedBy}
            onDelete={() => actions.remove(document)}
            onDownload={actions.download}
            onPreview={actions.preview}
          />
        </Box>
      ))}
  </>
);
