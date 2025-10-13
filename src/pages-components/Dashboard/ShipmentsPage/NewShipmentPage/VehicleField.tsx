import { type Vehicle, VehicleEnum } from '@/lib/api';
import { FormSingleSelect } from '@/lib/components/form';
import { useVehicles } from '@/lib/hooks';
import { renderVehicleName } from '@/lib/utils/vehicles';

import { useAgencyFieldReset } from './hooks';

function mapVehiclesToOptions(vehicles: Vehicle[], type?: VehicleEnum) {
  // Filter vehicles by allowed types
  if (type === VehicleEnum.TRAILER) {
    return vehicles.map((vehicle) => ({
      value: vehicle.id,
      label: renderVehicleName(vehicle),
    }));
  }

  const allowedTypes = [VehicleEnum.TRUCK, VehicleEnum.SOLO_TRUCK, VehicleEnum.VAN];
  const filteredVehicles = vehicles.filter((vehicle) => allowedTypes.includes(vehicle.type));

  // Group vehicles by type
  const groupedOptions = filteredVehicles.reduce(
    (acc, vehicle) => {
      const { id, type } = vehicle;
      const option = {
        value: id,
        label: renderVehicleName(vehicle),
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

interface VehicleFieldInterface {
  type?: VehicleEnum;
  label: string;
  name: string;
  placeholder: string;
}

export const VehicleField: React.FC<VehicleFieldInterface> = ({ type, label, name, placeholder }) => {
  const { data: vehicles = [] } = useVehicles({ type });
  const vehicleOptions = mapVehiclesToOptions(vehicles, type);

  const isAgencyUse = useAgencyFieldReset(name);

  // Hide the component completely when isAgencyUse is true
  if (isAgencyUse) {
    return null;
  }

  return (
    <FormSingleSelect
      isClearable
      isSearchable
      label={label}
      name={name}
      options={vehicleOptions}
      placeholder={placeholder}
    />
  );
};
