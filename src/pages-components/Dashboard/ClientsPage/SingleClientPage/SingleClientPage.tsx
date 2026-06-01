import { useRouter } from 'next/router';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import type { Client } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useClient } from '@/lib/hooks';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { getCountryFromCode } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Box, Divider, FlexLayout, Icon, Text } from '@/ui';

import { ClientActions } from './ClientActions';

export const SingleClientPage = () => {
  const { query } = useRouter();
  const id = query.id;

  const { data: client, isLoading } = useClient(id as string);

  return (
    <DashboardLayout>
      <PageTitle title={client?.name} type="Klijent" />
      {!client || isLoading ? (
        <LoadingPage />
      ) : (
        <Box>
          <MainContent client={client} />
        </Box>
      )}
    </DashboardLayout>
  );
};

const MainContent: React.FC<{ client: Client }> = ({ client }) => {
  const country = getCountryFromCode(client.address.countryCode);

  return (
    <FlexLayout className="py-5 flex-col gap-5">
      <BackButton targetLocation="/dashboard/clients" />
      <FlexLayout className="justify-between">
        <FlexLayout className="items-start gap-6">
          <FlexLayout className="flex-col gap-3 mt-[12px]">
            <FlexLayout className="gap-4 items-center">
              <Text variant="text-xxl-medium">{client.name}</Text>
            </FlexLayout>
            <FlexLayout className="flex-col gap-3 max-w-[400px]">
              <FlexLayout className="flex-col">
                <Text color="text-color-3" variant="text-m">
                  {client.address.streetName},
                </Text>
                <Text color="text-color-3" variant="text-m">
                  {[client.address.placeName, client.address.postalCode, country.name].filter(Boolean).join(', ')}
                </Text>
              </FlexLayout>
              <Divider />
              <FlexLayout className="flex-col">
                <Text color="text-color-2" variant="text-m">
                  Valuta plaćanja: <strong>{client.termsOfPayment ?? '—'}</strong>
                </Text>
              </FlexLayout>
              <FlexLayout className="flex-col">
                <Text color="text-color-2" variant="text-m">
                  VAT: <strong>{client.vatNumber}</strong>
                </Text>
              </FlexLayout>
              <FlexLayout className="flex-col">
                <Text color="text-color-2" variant="text-m">
                  Nacionalni identifikacijski broj: <strong>{client.nationalCompanyRegisterId}</strong>
                </Text>
              </FlexLayout>
              {client.email ? (
                <FlexLayout
                  className="group/email items-center gap-2 cursor-pointer text-color-2 hover:text-color-1 transition-colors ease"
                  onClick={() => copyToClipboard(client.email!)}
                >
                  <Text variant="text-m">
                    Email: <strong>{client.email}</strong>
                  </Text>
                  <Icon
                    className="opacity-0 translate-x-[-4px] group-hover/email:opacity-100 group-hover/email:translate-x-0 w-5 transition-transform ease"
                    icon="IconCopy"
                  />
                </FlexLayout>
              ) : (
                <FlexLayout className="flex-col">
                  <Text color="text-color-2" variant="text-m">
                    Email: <strong>—</strong>
                  </Text>
                </FlexLayout>
              )}
            </FlexLayout>
          </FlexLayout>
        </FlexLayout>
        <ClientActions id={client.id} name={client.name} />
      </FlexLayout>
    </FlexLayout>
  );
};
