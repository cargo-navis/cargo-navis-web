import { useRouter } from 'next/router';
import { useState } from 'react';

import { CountryFlag } from '@/components/countries';
import { generateShipmentPdf, type Shipment, type ShipmentPdfLanguage } from '@/lib/api';
import { useClient, useContractors, useDeleteAgencyShipment, useDeleteShipment } from '@/lib/hooks';
import { downloadBlob } from '@/lib/utils/file';
import { buildShipmentPdfFilename, SHIPMENT_PDF_LANGUAGES } from '@/lib/utils/shipments';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, Button, FlexLayout, Icon, Menu } from '@/ui';
import { MenuComponent } from '@/ui/components/Menu/types';

type PdfDocument = {
  label?: string;
  shipmentId: string;
  orderNumber: string;
  recipientName?: string;
};

export const ShipmentActions: React.FC<{ shipment: Shipment }> = ({ shipment }) => {
  const { id, isAgency } = shipment;
  const { back, push } = useRouter();

  const { mutateAsync: deleteRegularShipment, isPending: isDeletingRegular } = useDeleteShipment(id);
  const { mutateAsync: deleteAgencyShipment, isPending: isDeletingAgency } = useDeleteAgencyShipment(id);
  const deleteShipment = isAgency ? deleteAgencyShipment : deleteRegularShipment;
  const isDeleting = isAgency ? isDeletingAgency : isDeletingRegular;
  const { data: client } = useClient(shipment.clientId || '');
  const { data: contractors = [] } = useContractors();

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPdfMenuOpen, setIsPdfMenuOpen] = useState(false);

  const carrier = contractors.find((c) => c.id === shipment.transportContractorId);

  async function handleDelete() {
    const answer = confirm('Jeste li sigurni da želite izbrisati ovaj nalog?');
    if (!answer) return;

    try {
      await deleteShipment();
      showSuccessToast({ title: 'Nalog izbrisan' });
      void back();
    } catch {
      showErrorToast({ title: 'Greška s brisanjem naloga' });
    }
  }

  function handleCopyShipment() {
    void push(`/dashboard/shipments/new?copyFromId=${id}`);
  }

  async function handleDownloadPdf(pdfDocument: PdfDocument, language: ShipmentPdfLanguage) {
    setIsDownloadingPdf(true);
    try {
      const blob = await generateShipmentPdf(pdfDocument.shipmentId, language);
      downloadBlob(blob, buildShipmentPdfFilename({ ...pdfDocument, language }));
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showErrorToast({ title: 'Greška s preuzimanjem PDF-a' });
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  const clientDocument: PdfDocument = {
    label: 'Nalog za klijenta',
    shipmentId: id,
    orderNumber: shipment.orderNumber,
    recipientName: client?.name,
  };

  // The PDF for the carrier is generated from the outgoing (child) order,
  // which is the one id the UI takes from the shipment rather than routes to.
  const pdfDocuments: PdfDocument[] = isAgency
    ? [
        clientDocument,
        ...(shipment.childId
          ? [
              {
                label: 'Nalog za prijevoznika',
                shipmentId: shipment.childId,
                orderNumber: shipment.contractorOrderNumber ?? '',
                recipientName: carrier?.name,
              },
            ]
          : []),
      ]
    : [{ ...clientDocument, label: undefined }];

  const pdfMenuItems: MenuComponent[] = pdfDocuments.flatMap((pdfDocument, index) => [
    ...(index > 0 ? [{ type: 'divider' as const }] : []),
    ...(pdfDocument.label
      ? [
          {
            type: 'label' as const,
            text: pdfDocument.recipientName ? `${pdfDocument.label} · ${pdfDocument.recipientName}` : pdfDocument.label,
          },
        ]
      : []),
    ...SHIPMENT_PDF_LANGUAGES.map(({ value, text, flagCode }) => ({
      type: 'item' as const,
      iconLeft: () => (
        <Box>
          <CountryFlag code={flagCode} size="xs" />
        </Box>
      ),
      text,
      isDisabled: isDeleting || isDownloadingPdf,
      onClick: () => handleDownloadPdf(pdfDocument, value),
    })),
  ]);

  const menuItems: MenuComponent[] = [
    {
      type: 'item' as const,
      iconLeft: 'IconEdit',
      text: 'Uredi',
      isDisabled: isDeleting,
      href: `/dashboard/shipments/${id}/edit`,
    },
    {
      type: 'item' as const,
      iconLeft: 'IconTrash',
      text: 'Izbriši',
      isDisabled: isDeleting,
      onClick: handleDelete,
    },
  ];

  return (
    <FlexLayout className="items-center gap-3">
      <Button
        iconLeft="IconCopy"
        isDisabled={isDeleting}
        text="Kopiraj nalog"
        variant="secondary"
        onClick={handleCopyShipment}
      />
      <Menu
        control={
          <Box>
            <Button
              iconLeft="IconCloudDownload"
              iconRight="IconChevronDown"
              isDisabled={isDeleting}
              isLoading={isDownloadingPdf}
              text="Preuzmi PDF"
              variant="secondary"
            />
          </Box>
        }
        isOpen={isPdfMenuOpen}
        items={pdfMenuItems}
        minWidth="240px"
        position="bottom-end"
        onClose={() => setIsPdfMenuOpen(false)}
        onOpen={() => setIsPdfMenuOpen(true)}
      />
      <Menu
        control={
          <FlexLayout className="items-center hover:bg-dark-200 dark:hover:bg-light-800 p-1 cursor-pointer rounded-s">
            <Icon icon="IconDotsVertical" isDisabled={isDeleting} size="l" />
          </FlexLayout>
        }
        isOpen={isMenuOpen}
        items={menuItems}
        position="bottom-end"
        onClose={() => setIsMenuOpen(false)}
        onOpen={() => setIsMenuOpen(true)}
      />
    </FlexLayout>
  );
};
