import { type Vehicle, VehicleEnum } from '@/lib/api';
import { FormSingleSelect } from '@/lib/components/form';
import { useVehicles } from '@/lib/hooks';

function mapVehiclesToOptions(vehicles: Vehicle[]) {
  // Filter vehicles by allowed types
  const allowedTypes = [VehicleEnum.TRUCK, VehicleEnum.SOLO_TRUCK, VehicleEnum.VAN];
  const filteredVehicles = vehicles.filter((vehicle) => allowedTypes.includes(vehicle.type));

  // Group vehicles by type
  const groupedOptions = filteredVehicles.reduce(
    (acc, vehicle) => {
      const { id, registration, brand, type } = vehicle;
      const option = {
        value: id,
        label: `${registration} (${brand})`,
      };

      // Create group if it doesn't exist
      if (!acc[type]) {
        const label =
          type === VehicleEnum.TRUCK ? 'Tegljači' : type === VehicleEnum.SOLO_TRUCK ? 'Solo Kamioni' : 'Kombiji';
        acc[type] = { label, options: [] };
      }

      acc[type].options.push(option);
      return acc;
    },
    {} as Record<string, { label: string; options: { value: string; label: string }[] }>
  );

  // Convert the grouped options object to array
  return Object.values(groupedOptions);
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
