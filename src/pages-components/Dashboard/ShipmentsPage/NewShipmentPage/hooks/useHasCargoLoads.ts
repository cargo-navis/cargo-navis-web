import { useFormContext } from 'react-hook-form';

import type { ShipmentFields } from '../types';

export function useHasCargoLoads() {
  const { watch } = useFormContext<ShipmentFields>();
  const cargo = watch(`cargo`);

  if (!cargo || !Array.isArray(cargo)) {
    return false;
  }

  return cargo.some((item) => {
    return !!(item.loadingDate || item.unloadingDate);
  });
}
