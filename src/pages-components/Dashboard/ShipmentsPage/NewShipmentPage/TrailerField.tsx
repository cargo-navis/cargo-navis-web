import { VehicleEnum } from '@/lib/api/vehicles';
import { FormSingleSelect } from '@/lib/components/form';
import { useVehicles } from '@/lib/hooks';

import { useAgencyFieldReset } from './hooks';

export const TrailerField = () => {
  const { data: trailers = [] } = useVehicles({ type: VehicleEnum.TRAILER });
  const trailerOptions = trailers.map((trailer) => ({
    value: trailer.id,
    label: `${trailer.registration} (${trailer.brand})`,
  }));

  const isAgencyUse = useAgencyFieldReset('trailerId');

  // Hide the component completely when isAgencyUse is true
  if (isAgencyUse) {
    return null;
  }

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
