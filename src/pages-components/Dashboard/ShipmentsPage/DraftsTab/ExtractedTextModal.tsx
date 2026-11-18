import { useEffect, useState } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ShipmentDraft } from '@/lib/api';

interface ExtractedTextModalProps {
  draft: ShipmentDraft | null;
  onClose(): void;
}

/** The text the AI read from a draft's PDF (dialog lg). */
export const ExtractedTextModal: React.FC<ExtractedTextModalProps> = ({ draft, onClose }) => {
  // Keep the last opened draft so its content stays visible during the close animation.
  const [displayDraft, setDisplayDraft] = useState<ShipmentDraft | null>(draft);

  useEffect(() => {
    if (draft) setDisplayDraft(draft);
  }, [draft]);

  const extractedText = displayDraft?.aiExtractedData?.extractedText?.trim();

  return (
    <Dialog open={!!draft} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle className="pr-8 break-words">{displayDraft?.fileName}</DialogTitle>
          <DialogDescription>Tekst izvučen iz dokumenta</DialogDescription>
        </DialogHeader>
        <div className="max-h-[56dvh] overflow-y-auto rounded-lg bg-muted p-4">
          {extractedText ? (
            <pre className="font-mono text-sm break-words whitespace-pre-wrap">{extractedText}</pre>
          ) : (
            <p className="text-sm text-muted-foreground">Nema izvučenog teksta za ovaj dokument.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
