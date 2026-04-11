import { useRouter } from 'next/router';
import { useState } from 'react';

import { useDeleteShipment } from '@/lib/hooks';
import { getAuthTokens } from '@/lib/utils/session';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Button, FlexLayout, Icon, Menu } from '@/ui';
import { MenuComponent } from '@/ui/components/Menu/types';

export const ShipmentActions: React.FC<{ id: string }> = ({ id }) => {
  const { back, push } = useRouter();
  const { mutateAsync: deleteShipment, isPending: isDeleting } = useDeleteShipment(id);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  async function handleDownloadPdf() {
    setIsDownloadingPdf(true);
    try {
      const { accessToken } = getAuthTokens();

      if (!accessToken) {
        throw new Error('Error with authentication');
      }

      // Use fetch with authorization header
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shipments/${id}/generate-pdf`, {
        method: 'GET',
        headers: {
          Accept: 'application/pdf',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Get the blob directly from the fetch response
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `shipment-${id}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showErrorToast({ title: 'Greška s preuzimanjem PDF-a' });
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  const menuItems: MenuComponent[] = [
    {
      type: 'item' as const,
      iconLeft: 'PencilIcon',
      text: 'Uredi',
      isDisabled: isDeleting,
      href: `/dashboard/shipments/${id}/edit`,
    },
    {
      type: 'item' as const,
      iconLeft: 'TrashIcon',
      text: 'Izbriši',
      isDisabled: isDeleting,
      onClick: handleDelete,
    },
  ];

  return (
    <FlexLayout className="items-center gap-3">
      <Button
        iconLeft="ClipboardDocumentIcon"
        isDisabled={isDeleting}
        text="Kopiraj nalog"
        variant="secondary"
        onClick={handleCopyShipment}
      />
      <Button
        iconLeft="ArrowDownTrayIcon"
        isDisabled={isDeleting}
        isLoading={isDownloadingPdf}
        text="Preuzmi PDF"
        variant="secondary"
        onClick={handleDownloadPdf}
      />
      <Menu
        control={
          <FlexLayout className="items-center hover:bg-dark-200 dark:hover:bg-light-800 p-1 cursor-pointer rounded-s">
            <Icon icon="EllipsisVerticalIcon" isDisabled={isDeleting} size="l" />
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
