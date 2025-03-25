import { VehicleEnum } from '@/lib/api/vehicles';
import { FormSingleSelect } from '@/lib/components/form';
import { useVehicles } from '@/lib/hooks';
export const TrailerField = () => {
  const { data: trailers = [] } = useVehicles({ type: VehicleEnum.TRAILER });
  const trailerOptions = trailers.map((trailer) => ({
    value: trailer.id,
    label: `${trailer.registration} (${trailer.brand})`,
  }));

  return (
    <FormSingleSelect
      isClearable
      isSearchable
      label="Priključno vozilo"
      name="trailerId"
      options={trailerOptions}
      placeholder="Odaberi priključno vozilo..."
    />
  );
};
