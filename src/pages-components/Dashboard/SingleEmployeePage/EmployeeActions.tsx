import { useRouter } from 'next/router';

import { useDeleteEmployee } from '@/lib/hooks';
import { Button, FlexLayout } from '@/ui';

export const EmployeeActions: React.FC<{ id: string }> = ({ id }) => {
  const { back } = useRouter();
  const { mutateAsync, isPending } = useDeleteEmployee(id);

  async function handleDelete() {
    const answer = confirm('Jeste li sigurni da želite izbrisati ovog zaposlenika?');
    if (!answer) return;

    try {
      await mutateAsync();
      alert('Zaposlenik izbrisan');
      void back();
    } catch {
      alert('Error with deleting the employee');
    }
  }

  return (
    <FlexLayout className="gap-3">
      <Button
        as="a"
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
