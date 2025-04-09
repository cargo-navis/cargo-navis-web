import Link from 'next/link';
import { useRouter } from 'next/router';

import type { VehicleEnum } from '@/lib/api';
import { useDeleteVehicle } from '@/lib/hooks';
import { vehicleTypeToPathMap } from '@/lib/utils/vehicles';
import { Button, FlexLayout } from '@/ui';

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
    } catch {
      alert('Error with deleting the vehicle');
    }
  }

  return (
    <FlexLayout className="gap-3">
      <Link href={`${asPath}/edit`}>
        <Button iconLeft="PencilIcon" isDisabled={isPending} text="Uredi" variant="secondary" />
      </Link>
      <Button iconLeft="TrashIcon" isDisabled={isPending} text="Izbriši" onClick={handleDelete} />
    </FlexLayout>
  );
};
