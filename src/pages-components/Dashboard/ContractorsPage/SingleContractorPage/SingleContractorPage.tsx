import { useRouter } from 'next/router';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import type { Contractor } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useContractor } from '@/lib/hooks';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { getCountryFromCode } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Box, DisplayIf, Divider, FlexLayout, Icon, Text } from '@/ui';

import { ContractorActions } from './ContractorActions';

export const SingleContractorPage = () => {
  const { query } = useRouter();
  const id = query.id;

  const { data: contractor, isLoading } = useContractor(id as string);

  return (
    <DashboardLayout>
      <PageTitle title={contractor?.name} type="Kontraktor" />
      {!contractor || isLoading ? (
        <LoadingPage />
      ) : (
        <Box>
          <MainContent contractor={contractor} />
        </Box>
      )}
    </DashboardLayout>
  );
};

const MainContent: React.FC<{ contractor: Contractor }> = ({ contractor }) => {
  const country = getCountryFromCode(contractor.address.countryCode);

  return (
    <FlexLayout className="py-5 flex-col gap-5">
      <BackButton targetLocation="/dashboard/contractors" />
      <FlexLayout className="justify-between">
        <FlexLayout className="items-start gap-6">
          <FlexLayout className="flex-col gap-3 mt-[12px]">
            <FlexLayout className="gap-4 items-center">
              <Text variant="text-xxl-medium">{contractor.name}</Text>
            </FlexLayout>
            <FlexLayout className="flex-col gap-3 max-w-[400px]">
              <FlexLayout className="flex-col">
                <Text color="text-color-3" variant="text-m">
                  {contractor.address.streetName},
                </Text>
                <DisplayIf condition={!!contractor.address.placeName}>
                  <Text color="text-color-3" variant="text-m">
                    {contractor.address.placeName}, {contractor.address.postalCode}, {country.name}
                  </Text>
                </DisplayIf>
              </FlexLayout>
              <Divider />
              <FlexLayout className="flex-col">
                <Text color="text-color-2" variant="text-m">
                  Valuta plaćanja: <strong>{contractor.termsOfPayment || '—'}</strong>
                </Text>
              </FlexLayout>
              <FlexLayout className="flex-col">
                <Text color="text-color-2" variant="text-m">
                  VAT: <strong>{contractor.vatNumber}</strong>
                </Text>
              </FlexLayout>
              <FlexLayout className="flex-col">
                <Text color="text-color-2" variant="text-m">
                  Nacionalni identifikacijski broj: <strong>{contractor.nationalCompanyRegisterId}</strong>
                </Text>
              </FlexLayout>
              {contractor.email ? (
                <FlexLayout
                  className="group/email items-center gap-2 cursor-pointer text-color-2 hover:text-color-1 transition-colors ease"
                  onClick={() => copyToClipboard(contractor.email!)}
                >
                  <Text variant="text-m">
                    Email: <strong>{contractor.email}</strong>
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
        <ContractorActions id={contractor.id} name={contractor.name} />
      </FlexLayout>
    </FlexLayout>
  );
};
