import { useState } from 'react';
import type { UseFormSetValue } from 'react-hook-form';

import type { Cargo } from '@/lib/api';

import type { VehicleStopFormValues } from './schema';

export function useCargoSelection(setValue: UseFormSetValue<VehicleStopFormValues>) {
  const [loadingCargos, setLoadingCargos] = useState<Cargo[]>([]);
  const [unloadingCargos, setUnloadingCargos] = useState<Cargo[]>([]);

  function setCargos(side: 'loading' | 'unloading', cargos: Cargo[]) {
    (side === 'loading' ? setLoadingCargos : setUnloadingCargos)(cargos);
    setValue(
      `${side}CargoIds`,
      cargos.map((c) => c.id),
      { shouldDirty: true, shouldValidate: true }
    );
  }

  return { loadingCargos, unloadingCargos, setCargos };
}
