import { useEffect, useState } from 'react';

import type { ShipmentDraft } from '@/lib/api';
import { Box, Dialog, DialogContent, DialogHeader, DialogTitle, FlexLayout, Icon, Text } from '@/ui';

interface ExtractedTextModalProps {
  draft: ShipmentDraft | null;
  onClose(): void;
}

export const ExtractedTextModal: React.FC<ExtractedTextModalProps> = ({ draft, onClose }) => {
  // Keep the last opened draft around so its content stays visible during the
  // close transition — `draft` is cleared immediately on close, `open` drives
  // the animation.
  const [displayDraft, setDisplayDraft] = useState<ShipmentDraft | null>(draft);

  useEffect(() => {
    if (draft) setDisplayDraft(draft);
  }, [draft]);

  const extractedText = displayDraft?.aiExtractedData?.extractedText?.trim();

  return (
    <Dialog open={!!draft} onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby={undefined} className="max-w-[820px]">
        <DialogHeader className="flex-col">
          <FlexLayout className="items-center gap-1 text-dark-800 dark:text-light-50">
            <Icon icon="IconFileDescription" size="l" />
            <DialogTitle>
              <Text variant="text-m-medium">{displayDraft?.fileName}</Text>
            </DialogTitle>
          </FlexLayout>
          <Text as="span" color="text-color-3" variant="text-xs">
            Tekst izvučen iz dokumenta
          </Text>
        </DialogHeader>

        <Box className="max-h-[60vh] overflow-y-auto rounded-m bg-dark-50 dark:bg-light-800/40 p-4">
          {extractedText ? (
            <Text as="pre" className="whitespace-pre-wrap break-words font-mono" color="text-color-2" variant="text-s">
              {extractedText}
            </Text>
          ) : (
            <Text color="text-color-3" variant="text-s">
              Nema izvučenog teksta za ovaj dokument.
            </Text>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
