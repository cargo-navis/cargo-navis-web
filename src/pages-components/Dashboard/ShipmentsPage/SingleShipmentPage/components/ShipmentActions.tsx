import { useRouter } from 'next/router';
import { useState } from 'react';

import { CountryFlag } from '@/components/countries';
import type { Shipment } from '@/lib/api';
import { useClient, useContractors, useDeleteAgencyShipment, useDeleteShipment } from '@/lib/hooks';
import { getAuthTokens } from '@/lib/utils/session';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, Button, FlexLayout, Icon, Menu } from '@/ui';
import { MenuComponent } from '@/ui/components/Menu/types';

const toSnakeCase = (input: string) =>
  input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

type PdfLanguage = 'HR' | 'EN';

const PDF_LANGUAGES: { value: PdfLanguage; text: string; flagCode: string }[] = [
  { value: 'HR', text: 'Na hrvatskom', flagCode: 'HR' },
  { value: 'EN', text: 'Na engleskom', flagCode: 'GB' },
];

type PdfDocument = {
  label?: string;
  shipmentId: string;
  orderNumber: string;
  recipientName?: string;
};

const buildPdfFilename = (language: PdfLanguage, orderNumber: string, name?: string, fallbackId?: string) => {
  const slug = name ? toSnakeCase(name) : '';
  const suffix = language === 'EN' ? '-en' : '';
  if (!slug) return `shipment-${fallbackId}${suffix}.pdf`;
  return `${orderNumber}-${slug}-nalog${suffix}.pdf`;
};

export const ShipmentActions: React.FC<{ shipment: Shipment }> = ({ shipment }) => {
  const { id, isAgency } = shipment;
  const { back, push } = useRouter();
  // Deleting an agency shipment has to go through its own resource so the
  // outgoing order is removed along with it.
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

  async function handleDownloadPdf({ shipmentId, orderNumber, recipientName }: PdfDocument, language: PdfLanguage) {
    setIsDownloadingPdf(true);
    try {
      const { accessToken } = getAuthTokens();

      if (!accessToken) {
        throw new Error('Error with authentication');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shipments/${shipmentId}/generate-pdf?language=${language}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/pdf',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = buildPdfFilename(language, orderNumber, recipientName, shipmentId);
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
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
    ...PDF_LANGUAGES.map(({ value, text, flagCode }) => ({
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
