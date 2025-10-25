import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Tenant } from '@/lib/api/tenant.d';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useCurrentTenant } from '@/lib/hooks';
import { getDataPointDateString } from '@/lib/utils/date';
import { Box, DisplayIf, Divider, FlexLayout, Text } from '@/ui';

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

      <FlexLayout className="gap-8">
        <FlexLayout className="flex-col gap-4 max-w-[640px]">
          <Text color="text-color-2" variant="text-m-medium">
            Podaci tvrtke
          </Text>
          <FlexLayout className="relative flex-col gap-7 w-full">
            <FlexLayout as="section" className="flex-col gap-5">
              <Box className="flex-1">
                <FlexLayout className="flex-col">
                  <Text color="text-color-3" variant="text-s-medium">
                    Adresa
                  </Text>
                  <DisplayIf condition={!!address.streetName}>
                    <Text color="text-color-1" variant="text-s">
                      {address.streetName}
                    </Text>
                  </DisplayIf>
                  <DisplayIf condition={!!address.postalCode}>
                    <Text color="text-color-1" variant="text-s">
                      {address.postalCode}, {address.placeName}
                    </Text>
                  </DisplayIf>
                </FlexLayout>
              </Box>

              <Box className="py-4">
                <Divider />
              </Box>

              <FlexLayout className="gap-4">
                <Box className="flex-1">
                  <DataItem label="OIB" value={tenant.nationalCompanyRegisterId || '–'} />
                </Box>
                <Box className="flex-1">
                  <DataItem label="VAT" value={tenant.vatNumber || '–'} />
                </Box>
              </FlexLayout>

              <FlexLayout className="gap-4">
                <Box className="flex-1">
                  <DataItem label="Broj licence" value={tenant.communityLicenseId || '–'} />
                </Box>
              </FlexLayout>
              <Box className="flex-1">
                <DataItem
                  label="Datum isteka osiguranja"
                  value={getDataPointDateString(tenant.cargoInsuranceExpiryDate) || '–'}
                />
              </Box>
            </FlexLayout>
          </FlexLayout>
        </FlexLayout>
        <FlexLayout className="flex-col gap-4 max-w-[640px]">
          <Text color="text-color-2" variant="text-m-medium">
            Podaci za naloge
          </Text>
          <FlexLayout className="relative flex-col gap-7 w-full">
            <FlexLayout as="section" className="flex-col gap-5">
              <DataItem label="Podnožje naloga" value={tenant.shipmentFooter || '–'} />
            </FlexLayout>
            <FlexLayout as="section" className="flex-col gap-5">
              <DataItem label="Uvjeti transporta" value={tenant.shipmentTransportTerms || '–'} />
            </FlexLayout>
          </FlexLayout>
        </FlexLayout>
      </FlexLayout>
    </FlexLayout>
  );
};

const DataItem: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <FlexLayout className="flex-col gap-2">
      <Text color="text-color-3" variant="text-s-medium">
        {label}
      </Text>
      <Text className="whitespace-pre-wrap" color="text-color-1" variant="text-s">
        {value}
      </Text>
    </FlexLayout>
  );
};
