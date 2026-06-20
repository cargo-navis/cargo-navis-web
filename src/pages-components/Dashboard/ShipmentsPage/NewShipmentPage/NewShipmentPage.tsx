import { useRouter } from 'next/router';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useCurrentTenant, useShipment, useShipmentDraft } from '@/lib/hooks';
import { Box, FlexLayout, Heading, Text } from '@/ui';

import { ShipmentForm } from './ShipmentForm';

const draftNotReadyMessages: Record<string, string> = {
  PENDING_EXTRACTION: 'Nalog još čeka obradu. Pokušajte ponovno za nekoliko trenutaka.',
  PROCESSING: 'AI obrada naloga je u tijeku. Pokušajte ponovno za nekoliko trenutaka.',
  CONFIRMED: 'Ovaj nalog je već potvrđen.',
  FAILED: 'Obrada naloga nije uspjela.',
};

export const NewShipmentPage = () => {
  const { query } = useRouter();
  const { data: tenant, isLoading: isTenantLoading } = useCurrentTenant();
  const copyFromId = query.copyFromId as string | undefined;
  const draftId = query.draftId as string | undefined;

  const { data: copyFromShipment, isLoading: isCopyFromShipmentLoading } = useShipment(copyFromId || '');
  const { data: draft, isLoading: isDraftLoading } = useShipmentDraft(draftId);

  const isLoading = isTenantLoading || (copyFromId && isCopyFromShipmentLoading) || (draftId && isDraftLoading);

  if (isLoading || !tenant) return <LoadingPage />;

  if (draft && draft.status !== 'EXTRACTED') {
    const message = draftNotReadyMessages[draft.status] ?? 'Nalog još nije spreman.';

    return (
      <DashboardLayout>
        <PageTitle title="Nalog nije spreman" />
        <Box>
          <FlexLayout className="flex-col gap-[40px]">
            <Heading as="h1" variant="text-xl">
              Nalog nije spreman
            </Heading>
          </FlexLayout>
          <FlexLayout className="py-5 flex-col gap-4">
            <BackButton targetLocation="/dashboard/shipments?tab=drafts" />
            <Text color="text-color-2" variant="text-m">
              {message}
            </Text>
            {draft.status === 'FAILED' && draft.errorMessage && (
              <Text color="text-color-3" variant="text-s">
                {draft.errorMessage}
              </Text>
            )}
          </FlexLayout>
        </Box>
      </DashboardLayout>
    );
  }

  let pageTitle = 'Novi Nalog';
  if (copyFromShipment) {
    pageTitle = `Kopija naloga ${copyFromShipment.orderNumber}`;
  } else if (draft) {
    pageTitle = 'Novi nalog iz pripreme';
  }

  const backTarget = draft ? '/dashboard/shipments?tab=drafts' : '/dashboard/shipments';

  return (
    <DashboardLayout>
      <PageTitle title="Novi nalog" />
      <Box>
        <FlexLayout className="flex-col gap-2">
          <Heading as="h1" variant="text-xl">
            {pageTitle}
          </Heading>
          {draft && (
            <Text color="text-color-3" variant="text-m">
              {draft.fileName}
            </Text>
          )}
        </FlexLayout>
        <FlexLayout className="py-5 flex-col gap-[40px]">
          <BackButton targetLocation={backTarget} />
          <ShipmentForm
            copyFromId={copyFromId}
            draft={draft}
            draftId={draftId}
            shipment={copyFromShipment}
            tenant={tenant}
          />
        </FlexLayout>
      </Box>
    </DashboardLayout>
  );
};
