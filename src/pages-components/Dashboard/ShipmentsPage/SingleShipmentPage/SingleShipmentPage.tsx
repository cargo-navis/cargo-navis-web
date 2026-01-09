import Link from 'next/link';
import { useRouter } from 'next/router';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InvoiceStatus, Shipment } from '@/lib/api';
import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import { FileCard } from '@/lib/components/FileCard';
import { useShipment, useUpdateShipment } from '@/lib/hooks';
import { downloadFileByUuid } from '@/lib/utils/file';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, DisplayIf, Divider, FlexLayout, Pill, Text } from '@/ui';

import { invoiceStatusConfig } from '../const';
import { BasicInfo } from './components/BasicInfo';
import { CargoItem } from './components/CargoItem';
import { ContentLoader } from './components/ContentLoader';
import { InvoiceItem } from './components/InvoiceItem';
import { SendToDriver } from './components/SendToDriver';
import { ShipmentActions } from './components/ShipmentActions';
import { ShipmentFileUploadButton } from './components/ShipmentFileUploadButton';
import type { CargoWithMetadata } from './components/types';

export const SingleShipmentPage = () => {
  const { query } = useRouter();
  const id = query.id;

  const { data: shipment, isLoading } = useShipment(id as string);

  return (
    <DashboardLayout>
      {!shipment || isLoading ? (
        <ClientSideOnly>
          <ContentLoader />
        </ClientSideOnly>
      ) : (
        <Box>
          <MainContent shipment={shipment} />
        </Box>
      )}
    </DashboardLayout>
  );
};

const MainContent: React.FC<{ shipment: Shipment }> = ({ shipment }) => {
  const { data: parentShipment } = useShipment(shipment.parentShipmentId || '');
  const { mutateAsync: updateShipment, isPending } = useUpdateShipment();

  const handleInvoiceChange = async (invoiceStatus: InvoiceStatus) => {
    try {
      await updateShipment({
        id: shipment.id,
        invoiceStatus,
      });

      const invoiceStatusText = invoiceStatusConfig[invoiceStatus].label.toUpperCase();
      showSuccessToast({
        title: `Nalog označen kao ${invoiceStatusText}`,
      });
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Greška prilikom ažuriranja fakture. Pokušajte ponovno.' });
    }
  };

  const shouldRenderAgencyPill = !!shipment?.isAgencyUse && !shipment?.parentShipmentId;

  function handleDownloadFile(documentId: string) {
    downloadFileByUuid(shipment.id, documentId);
  }

  return (
    <FlexLayout className="py-5 flex-col gap-5">
      <FlexLayout className="justify-between">
        <BackButton targetLocation="/dashboard/shipments" />
        <ShipmentActions id={shipment.id} />
      </FlexLayout>
      <Box className="max-w-[1400px]">
        <FlexLayout className="relative flex-col gap-5 w-full">
          <FlexLayout className="flex-col gap-4">
            <FlexLayout className="flex-col gap-1">
              <FlexLayout className="items-center justify-between">
                <FlexLayout className="items-center gap-4">
                  <Text as="h1" variant="text-xl-medium">
                    Nalog #{shipment.orderNumber}
                  </Text>
                  <DisplayIf condition={shouldRenderAgencyPill}>
                    <Pill size="s" text="Agencijski Nalog" variant="warning" />
                  </DisplayIf>
                </FlexLayout>
                <InvoiceItem
                  invoiceStatus={shipment.invoiceStatus}
                  isPending={isPending}
                  onChange={handleInvoiceChange}
                />
              </FlexLayout>
              {shipment.parentShipmentId && parentShipment && (
                <Link className="max-w-max" href={`/dashboard/shipments/${parentShipment.id}`}>
                  <Text className="hover:text-teal-500 transition-colors" color="text-color-3" variant="text-s">
                    Podnalog od #{parentShipment.orderNumber}
                  </Text>
                </Link>
              )}
              <SendToDriver shipment={shipment} />
              <FlexLayout className="gap-4 mt-2">
                {shipment.documents?.map((document) => (
                  <FileCard key={document.id} {...document} onDownload={handleDownloadFile} />
                ))}
                <ShipmentFileUploadButton id={shipment.id} />
              </FlexLayout>
            </FlexLayout>
          </FlexLayout>
          <Divider />
          <FlexLayout className="flex-row gap-5">
            <FlexLayout className="w-[380px] flex-col gap-4">
              <BasicInfo shipment={shipment} />
              <Box className="py-4">
                <Divider />
              </Box>
            </FlexLayout>
            <FlexLayout as="section" className="flex-1 flex-col gap-4 min-w-0">
              <Text color="text-color-2" variant="text-l-medium">
                Tereti
              </Text>
              {(shipment.cargo as CargoWithMetadata[]).map((item, index) => (
                <CargoItem cargo={item} index={index} key={index} shipmentId={shipment.id} />
              ))}
            </FlexLayout>
          </FlexLayout>
        </FlexLayout>
      </Box>
    </FlexLayout>
  );
};
