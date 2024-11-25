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
    const answer = confirm('Jeste li sigurni da želite izbrisati ovo vozilo?');
    if (!answer) return;

    try {
      await mutateAsync();
      alert('Vozilo izbrisano');
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
        text="Uredi"
        variant="secondary"
      />
      <Button iconLeft="TrashIcon" isDisabled={isPending} text="Izbriši" onClick={handleDelete} />
    </Box>
  );
};
