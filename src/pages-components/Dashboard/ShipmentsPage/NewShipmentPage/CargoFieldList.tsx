import { useFormContext } from 'react-hook-form';

import { FlexLayout, TextButton } from '@/ui';

import { CargoField } from './CargoField';
import { defaultCargo } from './utils';
import type { Cargo, ShipmentFields } from './types';

export const CargoFieldList = () => {
  const { watch, setValue } = useFormContext<ShipmentFields>();
  const cargo = watch('cargo');

  return (
    <FlexLayout className="flex-1 flex-col gap-4">
      {cargo.map((_, index: number, arr: Cargo[]) => (
        <CargoField cargoLength={arr.length} index={index} key={index} />
      ))}
      <TextButton
        iconLeft="PlusIcon"
        text="Dodaj teret"
        type="button"
        variant="secondary"
        onClick={() => setValue('cargo', [...cargo, defaultCargo])}
      />
    </FlexLayout>
  );
};
