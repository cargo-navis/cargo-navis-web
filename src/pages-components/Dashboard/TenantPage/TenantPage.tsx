import { useEffect, useState } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Tenant } from '@/lib/api/tenant.d';
import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import { useCurrentTenant, useDeleteTenantLogo, useUploadTenantLogo } from '@/lib/hooks';
import { getDataPointDateString } from '@/lib/utils/date';
import { getFileInput } from '@/lib/utils/file';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, Button, DisplayIf, Divider, FlexLayout, Icon, LoadingSpinner, Text } from '@/ui';

import { ContentLoader } from './ContentLoader';
import { TenantActions } from './TenantActions';

export const TenantPage = () => {
  const { data: tenant, isLoading } = useCurrentTenant();

  if (isLoading || !tenant) {
    return (
      <DashboardLayout>
        <ClientSideOnly>
          <ContentLoader />
        </ClientSideOnly>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box>
        <MainContent tenant={tenant} />
      </Box>
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
      <TenantLogoField tenant={tenant} />
      <FlexLayout className="gap-8">
        <FlexLayout className="flex-col gap-4 w-[420px] shrink-0">
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

const TenantLogoField: React.FC<{ tenant: Tenant }> = ({ tenant }) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

  const { mutateAsync: uploadTenantLogo, isPending: isUploading } = useUploadTenantLogo();
  const { mutateAsync: deleteTenantLogo, isPending: isDeleting } = useDeleteTenantLogo();

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleDeleteLogo = async () => {
    const answer = confirm('Jeste li sigurni da želite izbrisati logo?');
    if (!answer) return;

    try {
      await deleteTenantLogo();
      showSuccessToast({ title: 'Logo uspješno izbrisan' });
    } catch {
      showErrorToast({ title: 'Dogodila se greška s brisanjem logoa. Pokušajte ponovno.' });
    }
  };

  const handleLogoChange = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      await uploadTenantLogo({ file, fileName: file.name });
      showSuccessToast({ title: 'Logo uspješno dodan' });
    } catch {
      showErrorToast({ title: 'Dogodila se greška s dodavanjem logoa. Pokušajte ponovno.' });
    } finally {
      setPreviewUrl(undefined);
    }
  };

  const isLoading = isUploading || isDeleting;

  const displayUrl = previewUrl || tenant.logo?.publicUrl;

  return (
    <FlexLayout className="flex-col gap-5">
      <Box className="relative rounded-l w-fit overflow-hidden">
        {displayUrl ? (
          <img alt={tenant.name} className="h-[150px] max-w-full" height="auto" src={displayUrl} width="auto" />
        ) : (
          <FlexLayout className=" bg-black-alpha-25 dark:bg-white-alpha-25 h-[150px] w-[150px] items-center justify-center">
            <Icon color="text-white" icon="PhotoIcon" size="xl" />
          </FlexLayout>
        )}
        <DisplayIf condition={isLoading}>
          <FlexLayout className="absolute inset-0 bg-black-alpha-50 items-center justify-center">
            <LoadingSpinner color="text-white" size="l" />
          </FlexLayout>
        </DisplayIf>
      </Box>
      <FlexLayout className="gap-2">
        <Button
          isDisabled={isLoading}
          isLoading={isUploading}
          size="s"
          text="Dodaj novi logo"
          variant="secondary"
          onClick={() => getFileInput(handleLogoChange, { accept: 'image/*' })}
        />
        <Button
          isDisabled={!tenant.logo?.publicUrl || isLoading}
          isLoading={isDeleting}
          size="s"
          text="Ukloni logo"
          variant="secondary"
          onClick={handleDeleteLogo}
        />
      </FlexLayout>
    </FlexLayout>
  );
};
