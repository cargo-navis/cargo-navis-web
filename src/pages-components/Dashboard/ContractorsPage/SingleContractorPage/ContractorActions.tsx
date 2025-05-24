import { useRouter } from 'next/router';

import { useDeleteContractor } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Button, FlexLayout } from '@/ui';

export const ContractorActions: React.FC<{ id: string }> = ({ id }) => {
  const { back } = useRouter();
  const { mutateAsync, isPending } = useDeleteContractor(id);

  async function handleDelete() {
    const answer = confirm('Jeste li sigurni da želite izbrisati ovog kontraktora?');
    if (!answer) return;

    try {
      await mutateAsync();
      showSuccessToast({ title: 'Kontraktor izbrisan' });
      void back();
    } catch {
      showErrorToast({ title: 'Greška s brisanjem kontraktora' });
    }
  }

  return (
    <FlexLayout className="gap-3">
      <Button
        href={`/dashboard/contractors/${id}/edit`}
        iconLeft="PencilIcon"
        isDisabled={isPending}
        text="Uredi"
        variant="secondary"
      />
      <Button iconLeft="TrashIcon" isLoading={isPending} text="Izbriši" onClick={handleDelete} />
    </FlexLayout>
  );
};
