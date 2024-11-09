import { vehicleTypeToPathMap } from '@/components/AlertMenu/utils';
import type { VehicleEnum } from '@/lib/api';
import { useDeleteVehicle } from '@/lib/hooks';
import { Box, Button } from '@/ui';
import { useRouter } from 'next/router';

export const VehicleActions: React.FC<{ id: string; type: VehicleEnum }> = ({ id, type }) => {
  const { asPath, push } = useRouter();
  const { mutateAsync, isPending } = useDeleteVehicle(id);

  const vehicleSegmentPath = vehicleTypeToPathMap[type];

  async function handleDelete() {
    const answer = confirm('Are you sure you want to delete this vehicle?');
    if (!answer) return;

    try {
      await mutateAsync();
      alert('Vehicle deleted');
      push(`/dashboard/fleet/${vehicleSegmentPath}`);
    } catch (error) {
      alert('Error with deleting the vehicle');
    }
  }

  return (
    <Box className="flex gap-5">
      <Button
        as="a"
        isDisabled={isPending}
        href={`${asPath}/edit`}
        iconLeft="PencilIcon"
        text="Edit"
        variant="secondary"
      />
      <Button iconLeft="TrashIcon" isDisabled={isPending} text="Delete" onClick={handleDelete} />
    </Box>
  );
};
