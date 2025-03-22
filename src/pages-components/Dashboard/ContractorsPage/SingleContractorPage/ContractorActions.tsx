import { useRouter } from 'next/router';

import { useDeleteContractor } from '@/lib/hooks';
import { Button, FlexLayout } from '@/ui';

export const ContractorActions: React.FC<{ id: string }> = ({ id }) => {
  const { push } = useRouter();
  const { mutateAsync, isPending } = useDeleteContractor(id);

  async function handleDelete() {
    const answer = confirm('Jeste li sigurni da želite izbrisati ovog kontraktora?');
    if (!answer) return;

    try {
      await mutateAsync();
      alert('Kontraktor izbrisan');
      await push('/dashboard/contractors');
    } catch {
      alert('Greška s brisanjem kontraktora');
    }
  }

  return (
    <FlexLayout className="gap-3">
      <Button
        as="a"
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
