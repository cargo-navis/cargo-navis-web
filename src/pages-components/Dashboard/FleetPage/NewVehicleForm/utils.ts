import { VehicleEnum } from '@/lib/api';
import { formDefaultValues, trailerFormDefaultValues, truckFormDefaultValues } from './const';

export function processFormData(data: any, type: VehicleEnum) {
  let processedData = { ...data };

  if (type === VehicleEnum.TRAILER) {
    const { length, width, height, ...rest } = processedData;
    const dimensions = { length, width, height };

    processedData = { ...rest, dimensions };
  }

  return { ...processedData };
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
