import { Box, Button } from '@/ui';
import { useDeleteEmployee } from '@/lib/hooks';
import { useRouter } from 'next/router';

export const EmployeeActions: React.FC<{ id: string }> = ({ id }) => {
  const { push } = useRouter();
  const { mutateAsync, isPending } = useDeleteEmployee(id);

  async function handleDelete() {
    const answer = confirm('Are you sure you want to delete this employee?');
    if(!answer) return;

    try {
      await mutateAsync();
      alert(`Employee deleted`);

      push('/dashboard/employees');
    } catch (error) {
      alert('Error with deleting the employee');
    }
  }

  return (
    <Box className="flex gap-5">
      <Button as="a" isDisabled={isPending} href={`/dashboard/employees/${id}/edit`} iconLeft="PencilIcon" text="Edit" variant="secondary" />
      <Button isLoading={isPending} iconLeft="TrashIcon" text="Delete" onClick={handleDelete} />
    </Box>
  );
}