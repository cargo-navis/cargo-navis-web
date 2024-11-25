import { type Vehicle, VehicleEnum } from '@/lib/api';
import { replaceEmptyStringsWithNull } from '@/lib/utils/data';
import { formDefaultValues, trailerFormDefaultValues, truckFormDefaultValues } from './const';

export function processFormData(data: any, type: VehicleEnum) {
  let processedData = { ...data };

  if (type !== VehicleEnum.TRUCK) {
    const { length, width, height, ...rest } = processedData;
    const dimensions = { length, width, height };

    processedData = { ...rest, dimensions };
  }

  const clearedData = replaceEmptyStringsWithNull(processedData);
  return { ...clearedData };
}

const typeDefaultFieldsMap = {
  [VehicleEnum.TRUCK]: truckFormDefaultValues,
  [VehicleEnum.TRAILER]: trailerFormDefaultValues,
  [VehicleEnum.SOLO_TRUCK]: {},
  [VehicleEnum.VAN]: {},
};

export function getDefaultValues(type: VehicleEnum) {
  const vehicleDefaultValues = typeDefaultFieldsMap[type];
  return { ...formDefaultValues, ...vehicleDefaultValues };
}

export function getEditDefaultValues(vehicle: Vehicle) {
  const { dimensions, ...rest } = vehicle;
  return { ...rest, ...dimensions };
}
