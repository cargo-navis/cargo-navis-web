import { useRouter } from 'next/router';

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

  return (
    <FlexLayout className="gap-5">
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
