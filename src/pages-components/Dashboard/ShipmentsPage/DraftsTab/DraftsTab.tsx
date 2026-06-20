import { createColumnHelper } from '@tanstack/react-table';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';

import { getShipmentDraftDocumentUrl, ShipmentDraft, type ShipmentDraftStatus } from '@/lib/api';
import { useDeleteShipmentDraft, useShipmentDrafts } from '@/lib/hooks';
import { getDateTimeInLocalTimezone } from '@/lib/utils/date';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, Button, FlexLayout, Icon, LoadingSpinner, Pill, Table, Text, Tooltip } from '@/ui';
import type { PillVariant } from '@/ui/components/Pill/const';

import { ExtractedTextModal } from './ExtractedTextModal';

const columnHelper = createColumnHelper<ShipmentDraft>();

const statusConfig: Record<ShipmentDraftStatus, { variant: PillVariant; label: string }> = {
  PENDING_EXTRACTION: { variant: 'info', label: 'Obrada u tijeku' },
  PROCESSING: { variant: 'info', label: 'Obrada u tijeku' },
  EXTRACTED: { variant: 'success', label: 'Spremno' },
  CONFIRMED: { variant: 'default', label: 'Potvrđeno' },
  FAILED: { variant: 'danger', label: 'Greška' },
};

export const DraftsTab = () => {
  const router = useRouter();
  const { data: drafts = [], isLoading } = useShipmentDrafts();
  const { mutateAsync: deleteDraft } = useDeleteShipmentDraft();

  const highlightedDraftId = typeof router.query.highlight === 'string' ? router.query.highlight : undefined;
  const containerRef = useRef<HTMLDivElement>(null);
  const [textDraft, setTextDraft] = useState<ShipmentDraft | null>(null);

  const sortedDrafts = useMemo(() => [...drafts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [drafts]);

  useEffect(() => {
    if (!highlightedDraftId || sortedDrafts.length === 0 || !containerRef.current) return;
    const row = containerRef.current.querySelector<HTMLElement>(`.draft-row-${CSS.escape(highlightedDraftId)}`);
    row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightedDraftId, sortedDrafts]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        header: 'Datoteka',
        meta: { fill: true },
        cell: (props) => (
          <FlexLayout
            as="button"
            className="items-start gap-2 py-3 text-left group"
            type="button"
            onClick={() => setTextDraft(props.row.original)}
          >
            <Icon className="mt-[2px]" color="text-color-3" icon="IconFileDescription" size="m" />
            <Text className="group-hover:underline" color="text-color-1" variant="text-s-medium">
              {props.row.original.fileName}
            </Text>
          </FlexLayout>
        ),
      }),
      columnHelper.display({
        header: 'Status',
        meta: { width: '180px' },
        cell: (props) => {
          const draft = props.row.original;
          const cfg = statusConfig[draft.status];
          const pill = <Pill size="s" text={cfg.label} variant={cfg.variant} />;

          if (draft.status === 'FAILED' && draft.errorMessage) {
            return (
              <Tooltip
                content={
                  <Box className="px-2 max-w-[280px]">
                    <Text as="p" color="text-light-50" variant="text-xs">
                      {draft.errorMessage}
                    </Text>
                  </Box>
                }
                isPortal
              >
                {pill}
              </Tooltip>
            );
          }

          return pill;
        },
      }),
      columnHelper.display({
        header: 'Kreirano',
        meta: { width: '180px' },
        cell: (props) => (
          <Text color="text-color-3" variant="text-s">
            {getDateTimeInLocalTimezone(props.row.original.createdAt)}
          </Text>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        meta: { width: '420px' },
        cell: (props) => {
          const draft = props.row.original;
          const isReady = draft.status === 'EXTRACTED';
          const documentId = draft.document?.id ?? null;

          async function handleDelete(event: React.MouseEvent) {
            event.stopPropagation();
            const ok = confirm('Jeste li sigurni da želite izbrisati ovaj nalog u pripremi?');
            if (!ok) return;

            try {
              await deleteDraft(draft.id);
              showSuccessToast({ title: 'Nalog u pripremi izbrisan' });
            } catch {
              showErrorToast({ title: 'Greška s brisanjem naloga u pripremi' });
            }
          }

          function handleOpen() {
            void router.push(`/dashboard/shipments/new?draftId=${draft.id}`);
          }

          async function handleOpenDocument() {
            if (!documentId) return;
            try {
              const url = await getShipmentDraftDocumentUrl(draft.id, documentId, 'inline');
              window.open(url, '_blank');
            } catch (error) {
              console.error(error);
              showErrorToast({ title: 'Greška prilikom pregleda dokumenta. Pokušajte ponovno.' });
            }
          }

          return (
            <FlexLayout className="items-center justify-end gap-2 pr-2">
              {documentId && (
                <Button
                  iconLeft="IconArrowUpRight"
                  size="s"
                  text="Otvori dokument"
                  variant="secondary"
                  onClick={handleOpenDocument}
                />
              )}
              {isReady && <Button iconLeft="IconArrowRight" size="s" text="Kreiraj nalog" onClick={handleOpen} />}
              <Button iconLeft="IconTrash" size="s" text="Izbriši" variant="danger" onClick={handleDelete} />
            </FlexLayout>
          );
        },
      }),
    ],
    [deleteDraft, router, setTextDraft]
  );

  if (isLoading) {
    return (
      <FlexLayout className="justify-center py-10">
        <LoadingSpinner size="l" />
      </FlexLayout>
    );
  }

  if (sortedDrafts.length === 0) {
    return (
      <FlexLayout className="flex-col gap-2 items-center justify-center my-10">
        <Text color="text-color-2" variant="text-l-medium">
          📥 Nema naloga u pripremi
        </Text>
        <Text color="text-color-3" variant="text-s">
          Povucite PDF bilo gdje na stranicu za upload novog naloga.
        </Text>
      </FlexLayout>
    );
  }

  return (
    <Box className="py-5" ref={containerRef}>
      <Table
        columns={columns}
        data={sortedDrafts}
        getRowClassName={(row) => {
          const draftId = row.original?.id;
          if (!draftId) return undefined;
          const classes = [`draft-row-${draftId}`];
          if (draftId === highlightedDraftId) {
            classes.push('row-highlight-fade');
          }
          return classes.join(' ');
        }}
      />
      <ExtractedTextModal draft={textDraft} onClose={() => setTextDraft(null)} />
    </Box>
  );
};
