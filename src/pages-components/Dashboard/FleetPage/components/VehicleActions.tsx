import { Box, Button } from '@/ui';
import { useRouter } from 'next/router';

export const VehicleActions: React.FC<{ id: string }> = ({ id }) => {
  const { asPath } = useRouter();

  function handleDelete() {
    console.log(id);
  }

  return (
    <Box className="flex gap-5">
      <Button as="a" href={`${asPath}/edit`} iconLeft="PencilIcon" text="Edit" variant="secondary" />
      <Button iconLeft="TrashIcon" text="Delete" onClick={handleDelete} />
    </Box>
  );
};
