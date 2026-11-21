/**
 * „Nalozi u pripremi” (today's DraftsTab, new look): uploaded PDFs the AI reads into a nalog. Datoteka (click = the
 * extracted text), Status, Kreirano, and Otvori dokument / Kreiraj nalog / Obriši (AlertDialog). `?highlight=<id>`
 * scrolls to a draft and flashes it.
 */

import { useRouter } from 'next/router';
import * as React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getShipmentDraftDocumentUrl, type ShipmentDraft, type ShipmentDraftStatus } from '@/lib/api';
import { useDeleteShipmentDraft, useShipmentDrafts } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/utils/date';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

import { ExtractedTextModal } from './ExtractedTextModal';

const STATUS: Record<
  ShipmentDraftStatus,
  { tone: 'info' | 'success' | 'neutral' | 'danger'; label: string; icon?: 'IconLoader2' }
> = {
  PENDING_EXTRACTION: { tone: 'info', label: 'Obrada u tijeku' },
  PROCESSING: { tone: 'info', label: 'Obrada u tijeku' },
  EXTRACTED: { tone: 'success', label: 'Spremno' },
  CONFIRMED: { tone: 'neutral', label: 'Potvrđeno' },
  FAILED: { tone: 'danger', label: 'Greška' },
};

function DraftStatus({ draft }: { draft: ShipmentDraft }) {
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

function DeleteDraftDialog({
  draft,
  onOpenChange,
}: {
  draft: ShipmentDraft | null;
  onOpenChange(open: boolean): void;
}) {
  const { mutateAsync: deleteDraft, isPending } = useDeleteShipmentDraft();
  async function handleDelete() {
    if (!draft) return;
    try {
      await deleteDraft(draft.id);
      showSuccessToast({ title: 'Nalog u pripremi obrisan' });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Nalog u pripremi nije obrisan', description: 'Pokušaj ponovno.' });
    }
  }
  return (
    <AlertDialog open={!!draft} onOpenChange={(open) => !isPending && onOpenChange(open)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Icon icon="IconTrash" size="m" />
          </AlertDialogMedia>
          <AlertDialogTitle>Obrisati nalog u pripremi?</AlertDialogTitle>
          <AlertDialogDescription>{draft?.fileName} · Ovo se ne može poništiti.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Odustani</AlertDialogCancel>
          <AlertDialogAction loading={isPending} variant="destructive" onClick={() => void handleDelete()}>
            <Icon data-icon="inline-start" icon="IconTrash" size="s" /> Obriši
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const DraftsTab = ({ onUpload }: { onUpload(): void }) => {
  const router = useRouter();
  const { data: drafts = [], isLoading } = useShipmentDrafts();
  const highlightedDraftId = typeof router.query.highlight === 'string' ? router.query.highlight : undefined;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [textDraft, setTextDraft] = React.useState<ShipmentDraft | null>(null);
  const [deleteDraft, setDeleteDraft] = React.useState<ShipmentDraft | null>(null);

  const sortedDrafts = React.useMemo(
    () => [...drafts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [drafts]
  );

  React.useEffect(() => {
    if (!highlightedDraftId || sortedDrafts.length === 0 || !containerRef.current) return;
    const row = containerRef.current.querySelector<HTMLElement>(`.draft-row-${CSS.escape(highlightedDraftId)}`);
    row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightedDraftId, sortedDrafts]);

  async function handleOpenDocument(draft: ShipmentDraft) {
    if (!draft.document) return;
    try {
      const url = await getShipmentDraftDocumentUrl(draft.id, draft.document.id, 'inline');
      window.open(url, '_blank');
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Dokument se nije otvorio', description: 'Pokušaj ponovno.' });
    }
  }

  return (
    <div className="overflow-clip rounded-xl border" ref={containerRef}>
      <Table>
        <TableHeader className="bg-muted">
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-3 text-muted-foreground">Datoteka</TableHead>
            <TableHead className="w-44 px-3 text-muted-foreground">Status</TableHead>
            <TableHead className="w-44 px-3 text-muted-foreground">Kreirano</TableHead>
            <TableHead className="px-3">
              <span className="sr-only">Akcije</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 4 }, (_, index) => (
              <TableRow className="hover:bg-transparent" key={index}>
                {Array.from({ length: 4 }, (__, cell) => (
                  <TableCell className="px-3 py-3" key={cell}>
                    <Skeleton className="h-4 w-3/4" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {!isLoading && sortedDrafts.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell className="whitespace-normal" colSpan={4}>
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Icon icon="IconFileUpload" size="m" />
                    </EmptyMedia>
                    <EmptyTitle>Nema naloga u pripremi</EmptyTitle>
                    <EmptyDescription>Povuci PDF naloga bilo gdje na stranicu ili ga odaberi.</EmptyDescription>
                  </EmptyHeader>
                  <Button variant="outline" onClick={onUpload}>
                    <Icon data-icon="inline-start" icon="IconUpload" size="s" /> Učitaj nalog
                  </Button>
                </Empty>
              </TableCell>
            </TableRow>
          )}
          {sortedDrafts.map((draft) => (
            <TableRow
              className={cn(
                `draft-row-${draft.id}`,
                draft.id === highlightedDraftId && 'row-highlight-fade',
                'hover:bg-muted/50'
              )}
              key={draft.id}
            >
              <TableCell className="px-3 py-3 whitespace-normal">
                <button
                  className="group flex items-start gap-2 text-left"
                  type="button"
                  onClick={() => setTextDraft(draft)}
                >
                  <Icon className="mt-0.5 text-muted-foreground" icon="IconFileDescription" size="s" />
                  <span className="font-medium group-hover:underline">{draft.fileName}</span>
                </button>
              </TableCell>
              <TableCell className="px-3 py-3">
                <DraftStatus draft={draft} />
              </TableCell>
              <TableCell className="px-3 py-3 text-muted-foreground tabular-nums">
                {formatDateTime(draft.createdAt)}
              </TableCell>
              <TableCell className="px-3 py-3">
                <div className="flex items-center justify-end gap-2">
                  {draft.document && (
                    <Button size="sm" variant="outline" onClick={() => void handleOpenDocument(draft)}>
                      <Icon data-icon="inline-start" icon="IconExternalLink" size="s" /> Otvori dokument
                    </Button>
                  )}
                  {draft.status === 'EXTRACTED' && (
                    <Button size="sm" onClick={() => void router.push(`/dashboard/shipments/new?draftId=${draft.id}`)}>
                      <Icon data-icon="inline-start" icon="IconArrowRight" size="s" /> Kreiraj nalog
                    </Button>
                  )}
                  <Button
                    aria-label={`Obriši ${draft.fileName}`}
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setDeleteDraft(draft)}
                  >
                    <Icon icon="IconTrash" size="s" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ExtractedTextModal draft={textDraft} onClose={() => setTextDraft(null)} />
      <DeleteDraftDialog draft={deleteDraft} onOpenChange={(open) => !open && setDeleteDraft(null)} />
    </div>
  );
};
