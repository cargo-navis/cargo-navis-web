import { useRouter } from 'next/router';

import type { VehicleEnum } from '@/lib/api';
import { useDeleteVehicle } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { vehicleTypeToPathMap } from '@/lib/utils/vehicles';
import { Button, FlexLayout } from '@/ui';

export const VehicleActions: React.FC<{ id: string; type: VehicleEnum; name: string }> = ({ id, type, name }) => {
  const { asPath, push } = useRouter();
  const { mutateAsync, isPending } = useDeleteVehicle(id);

  const vehicleSegmentPath = vehicleTypeToPathMap[type];

  async function handleDelete() {
    const answer = confirm(`Jeste li sigurni da želite izbrisati ovo vozilo "${name}"?`);
    if (!answer) return;

    try {
      await mutateAsync();
      showSuccessToast({ title: `Vozilo "${name}" izbrisano` });
      push(`/dashboard/fleet/${vehicleSegmentPath}`);
    } catch {
      showErrorToast({ title: 'Greška s brisanjem vozila' });
    }
  }

  return (
    <FlexLayout className="gap-3">
      <Button href={`${asPath}/edit`} iconLeft="IconEdit" isDisabled={isPending} text="Uredi" variant="secondary" />
      <Button iconLeft="IconTrash" isDisabled={isPending} text="Izbriši" onClick={handleDelete} />
    </FlexLayout>
  );
};
