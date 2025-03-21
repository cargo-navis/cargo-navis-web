import { useRouter } from 'next/router';

import { generatePdf } from '@/lib/api/shipments';
import { useDeleteShipment } from '@/lib/hooks';
import { Button, FlexLayout } from '@/ui';

export const ShipmentActions: React.FC<{ id: string }> = ({ id }) => {
  const { push } = useRouter();
  const { mutateAsync, isPending } = useDeleteShipment(id);

  async function handleDelete() {
    const answer = confirm('Jeste li sigurni da želite izbrisati ovaj nalog?');
    if (!answer) return;

    try {
      await mutateAsync();
      alert('Nalog izbrisan');
      await push('/dashboard/shipments');
    } catch {
      alert('Greška s brisanjem naloga');
    }
  }

  async function handleDownloadPdf() {
    try {
      const response = await generatePdf(id);

      // Create a Blob from the PDF data
      const blob = new Blob([response]);
      const url = window.URL.createObjectURL(blob);

      // Create a link and trigger download
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
      alert('Greška s preuzimanjem PDF-a');
    }
  }

  return (
    <FlexLayout className="gap-5">
      <Button
        iconLeft="ArrowDownTrayIcon"
        isDisabled={isPending}
        text="Preuzmi PDF"
        variant="secondary"
        onClick={handleDownloadPdf}
      />
      <Button
        as="a"
        href={`/dashboard/shipments/${id}/edit`}
        iconLeft="PencilIcon"
        isDisabled={isPending}
        text="Uredi"
        variant="secondary"
      />
      <Button iconLeft="TrashIcon" isLoading={isPending} text="Izbriši" onClick={handleDelete} />
    </FlexLayout>
  );
};
