import { useRouter } from 'next/router';

import { useDeleteClient } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Button, FlexLayout } from '@/ui';

export const ClientActions: React.FC<{ id: string; name: string }> = ({ id, name }) => {
  const { back } = useRouter();
  const { mutateAsync, isPending } = useDeleteClient(id);

  async function handleDelete() {
    const answer = confirm(`Jeste li sigurni da želite izbrisati ovog klijenta "${name}"?`);
    if (!answer) return;

    try {
      await mutateAsync();
      showSuccessToast({ title: `Klijent "${name}" izbrisan` });
      void back();
    } catch {
      showErrorToast({ title: 'Greška s brisanjem klijenta' });
    }
  }

  return (
    <FlexLayout className="gap-3">
      <Button
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
