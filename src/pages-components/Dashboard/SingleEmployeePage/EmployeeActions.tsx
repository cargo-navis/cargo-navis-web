import { useDeleteEmployee } from '@/lib/hooks';
import { Button, FlexLayout } from '@/ui';
import { useRouter } from 'next/router';

export const EmployeeActions: React.FC<{ id: string }> = ({ id }) => {
  const { push } = useRouter();
  const { mutateAsync, isPending } = useDeleteEmployee(id);

  async function handleDelete() {
    const answer = confirm('Jeste li sigurni da želite izbrisati ovog zaposlenika?');
    if (!answer) return;

    try {
      await mutateAsync();
      alert('Zaposlenik izbrisan');

      push('/dashboard/employees');
    } catch (error) {
      alert('Error with deleting the employee');
    }
  }

  return (
    <FlexLayout className="gap-5">
      <Button
        as="a"
        isDisabled={isPending}
        href={`/dashboard/employees/${id}/edit`}
        iconLeft="PencilIcon"
        text="Uredi"
        variant="secondary"
      />
      <Button isLoading={isPending} iconLeft="TrashIcon" text="Izbriši" onClick={handleDelete} />
    </FlexLayout>
  );
};
