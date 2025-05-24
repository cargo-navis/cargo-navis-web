import { useRouter } from 'next/router';

import { useDeleteEmployee } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Button, FlexLayout } from '@/ui';

export const EmployeeActions: React.FC<{ id: string }> = ({ id }) => {
  const { back } = useRouter();
  const { mutateAsync, isPending } = useDeleteEmployee(id);

  async function handleDelete() {
    const answer = confirm('Jeste li sigurni da želite izbrisati ovog zaposlenika?');
    if (!answer) return;

    try {
      await mutateAsync();
      showSuccessToast({ title: 'Zaposlenik izbrisan' });
      void back();
    } catch {
      showErrorToast({ title: 'Greška s brisanjem zaposlenika' });
    }
  }

  return (
    <FlexLayout className="gap-3">
      <Button
        href={`/dashboard/employees/${id}/edit`}
        iconLeft="PencilIcon"
        isDisabled={isPending}
        text="Uredi"
        variant="secondary"
      />
      <Button iconLeft="TrashIcon" isLoading={isPending} text="Izbriši" onClick={handleDelete} />
    </FlexLayout>
  );
};
