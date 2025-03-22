import { useRouter } from 'next/router';

import { useDeleteClient } from '@/lib/hooks';
import { Button, FlexLayout } from '@/ui';

export const ClientActions: React.FC<{ id: string }> = ({ id }) => {
  const { push } = useRouter();
  const { mutateAsync, isPending } = useDeleteClient(id);

  async function handleDelete() {
    const answer = confirm('Jeste li sigurni da želite izbrisati ovog klijenta?');
    if (!answer) return;

    try {
      await mutateAsync();
      alert('Klijent izbrisan');
      await push('/dashboard/clients');
    } catch {
      alert('Greška s brisanjem klijenta');
    }
  }

  return (
    <FlexLayout className="gap-3">
      <Button
        as="a"
        href={`/dashboard/clients/${id}/edit`}
        iconLeft="PencilIcon"
        isDisabled={isPending}
        text="Uredi"
        variant="secondary"
      />
      <Button iconLeft="TrashIcon" isLoading={isPending} text="Izbriši" onClick={handleDelete} />
    </FlexLayout>
  );
};
