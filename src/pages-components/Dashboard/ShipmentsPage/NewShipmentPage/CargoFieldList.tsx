import { useFormContext } from 'react-hook-form';

import { Button, FlexLayout, Text } from '@/ui';

import { CargoField } from './CargoField';
import type { Cargo, ShipmentFields } from './types';
import { defaultCargo } from './utils';

export const CargoFieldList = () => {
  const { watch, setValue } = useFormContext<ShipmentFields>();
  const cargo = watch('cargo');

  return (
    <FlexLayout className="flex-1 flex-col gap-4 min-w-0">
      <Text color="text-color-2" variant="text-l-medium">
        Tereti
      </Text>
      {cargo.map((_, index: number, arr: Cargo[]) => (
        <CargoField cargoLength={arr.length} index={index} key={index} />
      ))}
      <Button
        iconLeft="IconPlus"
        isFullWidth
        text="Dodaj teret"
        type="button"
        variant="secondary"
        onClick={() => setValue('cargo', [...cargo, defaultCargo], { shouldDirty: true })}
      />
    </FlexLayout>
  );
};
