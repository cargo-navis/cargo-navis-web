import Link from 'next/link';
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
      <Link href={`/dashboard/employees/${id}/edit`}>
        <Button iconLeft="PencilIcon" isDisabled={isPending} text="Uredi" variant="secondary" />
      </Link>
      <Button iconLeft="TrashIcon" isLoading={isPending} text="Izbriši" onClick={handleDelete} />
    </FlexLayout>
  );
};
