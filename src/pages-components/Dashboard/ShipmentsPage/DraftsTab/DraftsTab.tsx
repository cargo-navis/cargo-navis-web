import { createColumnHelper } from '@tanstack/react-table';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import type { ShipmentDraft, ShipmentDraftStatus } from '@/lib/api';
import { useDeleteShipmentDraft, useShipmentDrafts } from '@/lib/hooks';
import { getDateTimeInLocalTimezone } from '@/lib/utils/date';
import { Box, Button, FlexLayout, Icon, LoadingSpinner, Pill, Table, Text, Tooltip } from '@/ui';
import type { PillVariant } from '@/ui/components/Pill/const';

const columnHelper = createColumnHelper<ShipmentDraft>();

const statusConfig: Record<ShipmentDraftStatus, { variant: PillVariant; label: string }> = {
  PENDING_EXTRACTION: { variant: 'info', label: 'Čeka obradu' },
  PROCESSING: { variant: 'info', label: 'Obrada u tijeku' },
  EXTRACTED: { variant: 'success', label: 'Spremno' },
  CONFIRMED: { variant: 'default', label: 'Potvrđeno' },
  FAILED: { variant: 'danger', label: 'Greška' },
};

export const DraftsTab = () => {
  const router = useRouter();
  const { data: drafts = [], isLoading } = useShipmentDrafts();
  const { mutate: deleteDraft } = useDeleteShipmentDraft();

  const sortedDrafts = useMemo(() => [...drafts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [drafts]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        header: 'Datoteka',
        meta: { fill: true },
        cell: (props) => (
          <FlexLayout className="items-center gap-2 py-3">
            <Icon color="text-color-3" icon="IconFileDescription" size="m" />
            <Text color="text-color-1" variant="text-s-medium">
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
        meta: { width: '220px' },
        cell: (props) => {
          const draft = props.row.original;
          const isReady = draft.status === 'EXTRACTED';

          function handleDelete(event: React.MouseEvent) {
            event.stopPropagation();
            const ok = confirm('Jeste li sigurni da želite izbrisati ovaj nacrt?');
            if (!ok) return;
            deleteDraft(draft.id);
          }

          function handleOpen() {
            void router.push(`/dashboard/shipments/new?draftId=${draft.id}`);
          }

          return (
            <FlexLayout className="items-center justify-end gap-2 pr-2">
              {isReady && <Button iconLeft="IconArrowRight" size="s" text="Kreiraj nalog" onClick={handleOpen} />}
              <Button iconLeft="IconTrash" size="s" text="Izbriši" variant="danger" onClick={handleDelete} />
            </FlexLayout>
          );
        },
      }),
    ],
    [deleteDraft, router]
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
          📥 Nema nacrta
        </Text>
        <Text color="text-color-3" variant="text-s">
          Povucite PDF bilo gdje na stranicu za upload novog nacrta.
        </Text>
      </FlexLayout>
    );
  }

  return (
    <Box className="py-5">
      <Table columns={columns} data={sortedDrafts} />
    </Box>
  );
};
