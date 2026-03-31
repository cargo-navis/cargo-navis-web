import Link from 'next/link';
import { useRouter } from 'next/router';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InvoiceStatus, Shipment } from '@/lib/api';
import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import { FileCard } from '@/lib/components/FileCard';
import {
  useClient,
  useDeleteShipmentFile,
  useGetShipmentDocumentUrl,
  useShipment,
  useUpdateShipment,
} from '@/lib/hooks';
import { downloadShipmentFile } from '@/lib/utils/file';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, Divider, FlexLayout, Icon, Text } from '@/ui';

import { invoiceStatusConfig } from '../const';
import { OverdueIndicator } from '../OverdueIndicator';
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
  const { mutateAsync: updateShipment, isPending } = useUpdateShipment();
  const { mutateAsync: deleteFile, isPending: isDeletingFile } = useDeleteShipmentFile(shipment.id);
  const { mutateAsync: getDocumentUrl, isPending: isGettingDocumentUrl } = useGetShipmentDocumentUrl(shipment.id);

  const { data: client } = useClient(shipment.clientId || '');

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

  function handleDownloadFile(documentId: string) {
    try {
      downloadShipmentFile(shipment.id, documentId);
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Greška prilikom preuzimanja dokumenta. Pokušajte ponovno.' });
    }
  }

  async function handlePreview(documentId: string) {
    try {
      const url = await getDocumentUrl({ documentId, disposition: 'inline' });
      window.open(url, '_blank');
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Greška prilikom pregleda dokumenta. Pokušajte ponovno.' });
    }
  }

  async function handleDeleteFile(documentId: string, documentName: string) {
    const answer = confirm(`Jeste li sigurni da želite izbrisati ovaj dokument "${documentName}"?`);
    if (!answer) return;

    try {
      await deleteFile(documentId);
      showSuccessToast({ title: `Dokument "${documentName}" izbrisan` });
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Greška prilikom brisanja dokumenta. Pokušajte ponovno.' });
    }
  }

  const isLoading = isPending || isDeletingFile || isGettingDocumentUrl;

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
                <FlexLayout className="flex-col">
                  <FlexLayout className="items-center gap-4">
                    <Text as="h1" color="text-color-1" variant="text-xl-bold">
                      {shipment.orderNumber}
                    </Text>
                    <OverdueIndicator shipment={shipment} />
                  </FlexLayout>
                  <Link
                    className="flex items-center gap-1 text-dark-600 dark:text-light-300 hover:text-teal-500 transition-colors"
                    href={`/dashboard/clients/${client?.id}`}
                  >
                    <Icon icon="BriefcaseIcon" size="m" />
                    <Text className="overflow-hidden text-ellipsis" variant="text-m">
                      {client?.name}
                    </Text>
                  </Link>
                </FlexLayout>
                <InvoiceItem
                  invoiceStatus={shipment.invoiceStatus}
                  invoiceStatusUpdatedAt={shipment.invoiceStatusUpdatedAt}
                  isPending={isPending}
                  onChange={handleInvoiceChange}
                />
              </FlexLayout>
              <SendToDriver shipment={shipment} />
              <FlexLayout className="gap-4 mt-2">
                {shipment.documents?.map((document) => (
                  <Box className="max-w-[300px]" key={document.id}>
                    <FileCard
                      {...document}
                      isLoading={isLoading}
                      onDelete={(documentId) => handleDeleteFile(documentId, document.name)}
                      onDownload={handleDownloadFile}
                      onPreview={handlePreview}
                    />
                  </Box>
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
                <CargoItem cargo={item} index={index} key={shipment.cargo[index].id} />
              ))}
            </FlexLayout>
          </FlexLayout>
        </FlexLayout>
      </Box>
    </FlexLayout>
  );
};
