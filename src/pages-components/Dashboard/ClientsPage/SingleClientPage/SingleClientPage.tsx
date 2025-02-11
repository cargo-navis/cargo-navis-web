import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Client } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useClient } from '@/lib/hooks';
import { BackButton } from '@/pages-components/Dashboard/NewEmployeePage/BackButton';
import { getCountryFromCode } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Box, Divider, FlexLayout, Text } from '@/ui';
import { useRouter } from 'next/router';
import { ClientActions } from './ClientActions';

export const SingleClientPage = () => {
  const { query } = useRouter();
  const id = query.id;

  const { data: client, isLoading } = useClient(id as string);

  return (
    <DashboardLayout>
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
                  {client.address.city}, {client.address.postalCode}, {country.name}
                </Text>
              </FlexLayout>
              <Divider />
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
            </FlexLayout>
          </FlexLayout>
        </FlexLayout>
        <ClientActions id={client.id} />
      </FlexLayout>
    </FlexLayout>
  );
};
