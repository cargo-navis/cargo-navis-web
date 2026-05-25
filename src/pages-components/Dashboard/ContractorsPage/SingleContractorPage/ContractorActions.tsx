import { useRouter } from 'next/router';

import { useDeleteContractor } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Button, FlexLayout } from '@/ui';

export const ContractorActions: React.FC<{ id: string; name: string }> = ({ id, name }) => {
  const { back } = useRouter();
  const { mutateAsync, isPending } = useDeleteContractor(id);

  async function handleDelete() {
    const answer = confirm(`Jeste li sigurni da želite izbrisati ovog kontraktora "${name}"?`);
    if (!answer) return;

    try {
      await mutateAsync();
      showSuccessToast({ title: `Kontraktor "${name}" izbrisan` });
      void back();
    } catch {
      showErrorToast({ title: 'Greška s brisanjem kontraktora' });
    }
  }

  return (
    <FlexLayout className="gap-3">
      <Button
        href={`/dashboard/contractors/${id}/edit`}
        iconLeft="IconEdit"
        isDisabled={isPending}
        text="Uredi"
        variant="secondary"
      />
      <Button iconLeft="IconTrash" isLoading={isPending} text="Izbriši" onClick={handleDelete} />
    </FlexLayout>
  );
};
