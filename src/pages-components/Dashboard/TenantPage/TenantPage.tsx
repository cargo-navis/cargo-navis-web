import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Tenant } from '@/lib/api/tenant.d';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useCurrentTenant } from '@/lib/hooks';
import { getDataPointDateString } from '@/lib/utils/date';
import { Box, Divider, FlexLayout, Text } from '@/ui';

import { TenantActions } from './TenantActions';

export const TenantPage = () => {
  const { data: tenant, isLoading } = useCurrentTenant();

  return (
    <DashboardLayout>
      {!tenant || isLoading ? (
        <LoadingPage />
      ) : (
        <Box>
          <MainContent tenant={tenant} />
        </Box>
      )}
    </DashboardLayout>
  );
};

const MainContent: React.FC<{ tenant: Tenant }> = ({ tenant }) => {
  const { address } = tenant;

  return (
    <FlexLayout className="py-5 flex-col gap-5">
      <FlexLayout className="justify-between">
        <Text as="h1" variant="text-xl-medium">
          {tenant.name}
        </Text>
        <TenantActions />
      </FlexLayout>

      <Box className="max-w-[720px]">
        <FlexLayout className="relative flex-col gap-7 w-full">
          <FlexLayout as="section" className="flex-col gap-5">
            <Box className="flex-1">
              <FlexLayout className="flex-col">
                <Text color="text-color-3" variant="text-s-medium">
                  Adresa
                </Text>
                <Text variant="text-l">
                  {address.placeName}, {address.postalCode}
                </Text>
              </FlexLayout>
            </Box>

            <Box className="py-4">
              <Divider />
            </Box>

            <FlexLayout className="gap-4">
              <Box className="flex-1">
                <FlexLayout className="flex-col">
                  <Text color="text-color-3" variant="text-s-medium">
                    OIB
                  </Text>
                  <Text variant="text-l">{tenant.nationalCompanyRegisterId || '–'}</Text>
                </FlexLayout>
              </Box>
              <Box className="flex-1">
                <FlexLayout className="flex-col">
                  <Text color="text-color-3" variant="text-s-medium">
                    VAT
                  </Text>
                  <Text variant="text-l">{tenant.vatNumber || '–'}</Text>
                </FlexLayout>
              </Box>
            </FlexLayout>

            <FlexLayout className="gap-4">
              <Box className="flex-1">
                <FlexLayout className="flex-col">
                  <Text color="text-color-3" variant="text-s-medium">
                    Broj licence
                  </Text>
                  <Text variant="text-l">{tenant.communityLicenseId || '–'}</Text>
                </FlexLayout>
              </Box>
            </FlexLayout>
            <Box className="flex-1">
              <FlexLayout className="flex-col">
                <Text color="text-color-3" variant="text-s-medium">
                  Datum isteka osiguranja
                </Text>
                <Text variant="text-l">{getDataPointDateString(tenant.cargoInsuranceExpiryDate) || '–'}</Text>
              </FlexLayout>
            </Box>
          </FlexLayout>
        </FlexLayout>
      </Box>
    </FlexLayout>
  );
};
