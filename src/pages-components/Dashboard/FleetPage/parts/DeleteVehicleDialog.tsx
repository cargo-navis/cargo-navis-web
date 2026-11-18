import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteVehicle as deleteVehicleRequest, type Vehicle } from '@/lib/api';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

/**
 * „Obrisati vozilo?” (lab /fleet DeleteConfirm). `vehicle` null = closed. `onDeleted` runs (and is awaited, e.g. a
 * navigation away from the vehicle page) before the fleet list refetches, so the deleted vehicle's page never flashes
 * „Vozilo nije pronađeno”.
 */
export function DeleteVehicleDialog({
  vehicle,
  onOpenChange,
  onDeleted,
}: {
  vehicle: Vehicle | null;
  onOpenChange(open: boolean): void;
  onDeleted?(): unknown;
}) {
  const queryClient = useQueryClient();
  const { mutateAsync: deleteVehicle, isPending } = useMutation({
    mutationFn: (id: string) => deleteVehicleRequest(id),
  });

  async function handleDelete() {
    if (!vehicle) return;
    try {
      await deleteVehicle(vehicle.id);
    } catch {
      showErrorToast({ title: 'Vozilo nije obrisano. Pokušajte ponovno.' });
      return;
    }
    showSuccessToast({ title: 'Vozilo obrisano', description: vehicle.registration });
    onOpenChange(false);
    try {
      await onDeleted?.();
    } finally {
      void queryClient.invalidateQueries({ queryKey: ['vehicles'], type: 'all' });
    }
  }

  return (
    <AlertDialog open={!!vehicle} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Icon icon="IconTrash" size="m" />
          </AlertDialogMedia>
          <AlertDialogTitle>Obrisati vozilo?</AlertDialogTitle>
          <AlertDialogDescription>
            {vehicle && (vehicle.brand ? `${vehicle.registration} (${vehicle.brand})` : vehicle.registration)} nestaje
            iz flote i ne može se dodijeliti nalozima. Ovo se ne može poništiti.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Odustani</AlertDialogCancel>
          <AlertDialogAction loading={isPending} variant="destructive" onClick={() => void handleDelete()}>
            <Icon data-icon="inline-start" icon="IconTrash" size="s" /> Obriši
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
