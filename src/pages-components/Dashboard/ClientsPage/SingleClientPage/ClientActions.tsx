import Link from 'next/link';
import { useRouter } from 'next/router';

import { useDeleteClient } from '@/lib/hooks';
import { Button, FlexLayout } from '@/ui';

export const ClientActions: React.FC<{ id: string }> = ({ id }) => {
  const { back } = useRouter();
  const { mutateAsync, isPending } = useDeleteClient(id);

  async function handleDelete() {
    const answer = confirm('Jeste li sigurni da želite izbrisati ovog klijenta?');
    if (!answer) return;

    try {
      await mutateAsync();
      alert('Klijent izbrisan');
      void back();
    } catch {
      alert('Greška s brisanjem klijenta');
    }
  }

  return (
    <FlexLayout className="gap-3">
      <Link href={`/dashboard/clients/${id}/edit`}>
        <Button iconLeft="PencilIcon" isDisabled={isPending} text="Uredi" variant="secondary" />
      </Link>
      <Button iconLeft="TrashIcon" isLoading={isPending} text="Izbriši" onClick={handleDelete} />
    </FlexLayout>
  );
};
