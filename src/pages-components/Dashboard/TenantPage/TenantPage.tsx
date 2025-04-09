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

export const MainContent: React.FC<{ tenant: Tenant }> = ({ tenant }) => {
  const { address } = tenant;

  return (
    <FlexLayout className="flex-col gap-3 max-w-[400px]">
      <FlexLayout className="gap-3 items-center justify-between">
        <Text color="text-color-1" variant="text-xxl-bold">
          {tenant.name}
        </Text>
        <TenantActions />
      </FlexLayout>
      <FlexLayout className="flex-col">
        <Text color="text-color-3" variant="text-m">
          {address.placeName}, {address.postalCode}
        </Text>
      </FlexLayout>
      <Divider />
      <FlexLayout className="flex-col">
        <Text color="text-color-2" variant="text-m">
          VAT: <strong>{tenant.vatNumber}</strong>
        </Text>
      </FlexLayout>
      <FlexLayout className="flex-col">
        <Text color="text-color-2" variant="text-m">
          OIB: <strong>{tenant.nationalCompanyRegisterId}</strong>
        </Text>
      </FlexLayout>
      <FlexLayout className="flex-col">
        <Text color="text-color-2" variant="text-m">
          Broj licence: <strong>{tenant.communityLicenseId}</strong>
        </Text>
      </FlexLayout>
      <FlexLayout className="flex-col">
        <Text color="text-color-2" variant="text-m">
          Datum isteka osiguranja: <strong>{getDataPointDateString(tenant.cargoInsuranceExpiryDate)}</strong>
        </Text>
      </FlexLayout>
      <FlexLayout className="flex-col">
        <Text color="text-color-2" variant="text-m">
          Valuta plaćanja: <strong>{tenant.termsOfPayment}</strong>
        </Text>
      </FlexLayout>
    </FlexLayout>
  );
};
