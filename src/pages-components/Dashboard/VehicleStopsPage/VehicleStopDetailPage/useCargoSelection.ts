import { useState } from 'react';
import type { UseFormSetValue } from 'react-hook-form';

import type { Cargo } from '@/lib/api';
import type { VehicleStop, VehicleStopCargo } from '@/lib/api/vehicleStops';

import type { VehicleStopFormValues } from './schema';

// Stop cargos carry their shipment nested; flatten clientId so chips/labels match the Cargo shape.
function mapStopCargos(cargos?: VehicleStopCargo[]): Cargo[] {
  return (cargos ?? []).map((c) => ({ ...(c as unknown as Cargo), clientId: c.shipment?.clientId }));
}

export function useCargoSelection(setValue: UseFormSetValue<VehicleStopFormValues>, stop?: VehicleStop) {
  const [loadingCargos, setLoadingCargos] = useState<Cargo[]>(() => mapStopCargos(stop?.loadingCargos));
  const [unloadingCargos, setUnloadingCargos] = useState<Cargo[]>(() => mapStopCargos(stop?.unloadingCargos));

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
