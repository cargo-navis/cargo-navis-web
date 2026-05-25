import { useRouter } from 'next/router';

import { useDeleteEmployee } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Button, FlexLayout } from '@/ui';

export const EmployeeActions: React.FC<{ id: string; name: string }> = ({ id, name }) => {
  const { back } = useRouter();
  const { mutateAsync, isPending } = useDeleteEmployee(id);

  async function handleDelete() {
    const answer = confirm(`Jeste li sigurni da želite deaktivirati zaposlenika "${name}"?`);
    if (!answer) return;

    try {
      await mutateAsync();
      showSuccessToast({ title: `Zaposlenik "${name}" deaktiviran.` });
      void back();
    } catch {
      showErrorToast({ title: 'Greška s deaktiviranjem zaposlenika.' });
    }
  }

  return (
    <FlexLayout className="gap-3">
      <Button
        href={`/dashboard/employees/${id}/edit`}
        iconLeft="IconEdit"
        isDisabled={isPending}
        text="Uredi"
        variant="secondary"
      />
      <Button iconLeft="IconTrash" isLoading={isPending} text="Deaktiviraj" variant="danger" onClick={handleDelete} />
    </FlexLayout>
  );
};
