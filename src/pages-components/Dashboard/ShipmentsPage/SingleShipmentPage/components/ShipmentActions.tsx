import { useRouter } from 'next/router';
import { useState } from 'react';

import type { Shipment } from '@/lib/api';
import { useClient, useContractors, useDeleteShipment } from '@/lib/hooks';
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

const buildPdfFilename = (orderNumber: string, name?: string, fallbackId?: string) => {
  const slug = name ? toSnakeCase(name) : '';
  if (!slug) return `shipment-${fallbackId}.pdf`;
  return `${orderNumber}-${slug}-nalog.pdf`;
};

export const ShipmentActions: React.FC<{ shipment: Shipment }> = ({ shipment }) => {
  const { id } = shipment;
  const { back, push } = useRouter();
  const { mutateAsync: deleteShipment, isPending: isDeleting } = useDeleteShipment(id);
  const { data: client } = useClient(shipment.clientId || '');
  const { data: contractors = [] } = useContractors();

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPdfMenuOpen, setIsPdfMenuOpen] = useState(false);

  const isAgency = (shipment.children?.length ?? 0) > 0;

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

  async function handleDownloadPdf(shipmentId: string, orderNumber: string, recipientName?: string) {
    setIsDownloadingPdf(true);
    try {
      const { accessToken } = getAuthTokens();

      if (!accessToken) {
        throw new Error('Error with authentication');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shipments/${shipmentId}/generate-pdf`, {
        method: 'GET',
        headers: {
          Accept: 'application/pdf',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = buildPdfFilename(orderNumber, recipientName, shipmentId);
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

  const pdfMenuItems: MenuComponent[] = isAgency
    ? [
        {
          type: 'item' as const,
          iconLeft: 'IconCloudDownload',
          text: 'Nalog za klijenta',
          helper: client?.name,
          isDisabled: isDeleting || isDownloadingPdf,
          onClick: () => handleDownloadPdf(id, shipment.orderNumber, client?.name),
        },
        ...(shipment.children ?? []).map((child) => {
          const transporter = contractors.find((c) => c.id === child.transportContractorId);
          return {
            type: 'item' as const,
            iconLeft: 'IconCloudDownload' as const,
            text: 'Nalog za prijevoznika',
            helper: transporter?.name,
            isDisabled: isDeleting || isDownloadingPdf,
            onClick: () => handleDownloadPdf(child.id, child.orderNumber, transporter?.name),
          };
        }),
      ]
    : [];

  const menuItems: MenuComponent[] = [
    // {
    //   type: 'item' as const,
    //   iconLeft: 'IconEdit',
    //   text: 'Uredi',
    //   isDisabled: isDeleting,
    //   href: `/dashboard/shipments/${id}/edit`,
    // },
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
      {isAgency ? (
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
      ) : (
        <Button
          iconLeft="IconCloudDownload"
          isDisabled={isDeleting}
          isLoading={isDownloadingPdf}
          text="Preuzmi PDF"
          variant="secondary"
          onClick={() => handleDownloadPdf(id, shipment.orderNumber, client?.name)}
        />
      )}
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
