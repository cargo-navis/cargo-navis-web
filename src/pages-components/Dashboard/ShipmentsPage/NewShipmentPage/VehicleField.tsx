import { type Vehicle } from '@/lib/api';
import { FormSingleSelect } from '@/lib/components/form';
import { useVehicles } from '@/lib/hooks';

function mapVehiclesToOptions(vehicles: Vehicle[]) {
  return vehicles.map(({ id, registration, brand }) => ({
    value: id,
    label: `${registration} (${brand})`,
  }));
}

export const VehicleField = () => {
  const { data: vehicles = [] } = useVehicles();
  const vehicleOptions = mapVehiclesToOptions(vehicles);

  return (
    <FormSingleSelect
      isClearable
      isSearchable
      label="Vozilo"
      name="vehicleId"
      options={vehicleOptions}
      placeholder="Odaberi vozilo..."
    />
  );
};
