import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { ShipmentDraft, ShipmentDraftStatus } from '@/lib/api';

const STATUS: Record<ShipmentDraftStatus, { tone: 'info' | 'success' | 'neutral' | 'danger'; label: string }> = {
  PENDING_EXTRACTION: { tone: 'info', label: 'Obrada u tijeku' },
  PROCESSING: { tone: 'info', label: 'Obrada u tijeku' },
  EXTRACTED: { tone: 'success', label: 'Spremno' },
  CONFIRMED: { tone: 'neutral', label: 'Potvrđeno' },
  FAILED: { tone: 'danger', label: 'Greška' },
};

/** The AI hasn't finished reading the PDF yet. */
export const isDraftProcessing = (draft: Pick<ShipmentDraft, 'status'>) =>
  draft.status === 'PENDING_EXTRACTION' || draft.status === 'PROCESSING';

/** The draft's status pill; a failed one shows the reason on hover. */
export function DraftStatus({ draft }: { draft: ShipmentDraft }) {
  const config = STATUS[draft.status];
  const badge = <Badge tone={config.tone}>{config.label}</Badge>;
  if (draft.status !== 'FAILED' || !draft.errorMessage) return badge;
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex cursor-default" />}>{badge}</TooltipTrigger>
      <TooltipContent className="max-w-72">{draft.errorMessage}</TooltipContent>
    </Tooltip>
  );
}
