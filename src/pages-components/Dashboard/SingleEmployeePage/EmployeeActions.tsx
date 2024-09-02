import { Box, Button } from '@/ui';
import { deleteEmployee } from '@/lib/api';

export const EmployeeActions: React.FC<{ id: string }> = ({ id }) => {
  return (
    <Box className="flex gap-5">
      <Button as="a" href={`/dashboard/employees/${id}/edit`} iconLeft="PencilIcon" text="Edit" variant="secondary" />
      <Button iconLeft="TrashIcon" text="Delete" onClick={async () => deleteEmployee(id)} />
    </Box>
  );
}