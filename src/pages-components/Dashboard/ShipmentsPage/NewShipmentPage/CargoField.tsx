import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';

import { FormSingleSelect, FormTextInput } from '@/lib/components/form';
import { FormTextarea } from '@/lib/components/form/FormTextarea';
import { roundLdmValue } from '@/lib/utils/math';
import { palleteOptions, palleteValues } from '@/lib/utils/palletes';
import { Box, Button, Checkbox, FlexLayout, Icon, Text } from '@/ui';

interface CargoFieldProps {
  index: number;
  cargoLength: number;
}

export const CargoField = ({ index, cargoLength }: CargoFieldProps) => {
  const { watch, setValue, getValues } = useFormContext();
  const cargoType = watch(`cargo.${index}.metadata.type`);
  const isStandardCargo = cargoType === 'standard';

  const setCargoType = (type: 'standard' | 'nonstandard') => {
    setValue(`cargo.${index}.metadata.type`, type);
  };

  const removeCargo = () => {
    const currentCargo = getValues('cargo');
    const updatedCargo = currentCargo.filter((_: any, i: number) => i !== index);
    setValue('cargo', updatedCargo, { shouldDirty: true });
  };

  return (
    <FlexLayout
      as="fieldset"
      className="flex-col max-h-max gap-4 bg-black-alpha-10 dark:bg-white-alpha-10 p-4 rounded-s"
    >
      <FlexLayout className="justify-between items-center">
        <Text color="text-color-3" variant="text-s-medium">
          TERET {index + 1}
        </Text>
        {cargoLength > 1 && <Icon icon="XMarkIcon" onClick={removeCargo} />}
      </FlexLayout>
      <FlexLayout className="flex-col gap-4">
        <FlexLayout className="gap-2">
          <Box className="flex-1">
            <Button
              isFullWidth
              text="Standardni teret"
              type="button"
              variant={isStandardCargo ? 'primary' : 'secondary'}
              onClick={() => setCargoType('standard')}
            />
          </Box>
          <Box className="flex-1">
            <Button
              isFullWidth
              text="Nestandardni teret"
              type="button"
              variant={!isStandardCargo ? 'primary' : 'secondary'}
              onClick={() => setCargoType('nonstandard')}
            />
          </Box>
        </FlexLayout>
        {isStandardCargo ? <StandardCargo index={index} /> : <NonStandardCargo index={index} />}
        <FormTextInput label="Težina (kg)" name={`cargo.${index}.weight`} rules={{ required: true }} />
        <FormTextarea label="Opis tereta" name={`cargo.${index}.description`} />
      </FlexLayout>
    </FlexLayout>
  );
};

const StandardCargo: React.FC<{ index: number }> = ({ index }) => {
  const { watch, setValue, getValues } = useFormContext();

  useEffect(() => {
    const { unsubscribe } = watch((_, { name }) => {
      const palleteTypeName = `cargo.${index}.metadata.palleteType`;
      const palleteAmountName = `cargo.${index}.metadata.palleteAmount`;

      if (name === palleteTypeName || name === palleteAmountName) {
        const [palleteType, palleteAmount] = getValues([palleteTypeName, palleteAmountName]);
        const ldmValue = palleteType && palleteAmount ? roundLdmValue(palleteValues[palleteType] * palleteAmount) : 0;
        setValue(`cargo.${index}.ldm`, ldmValue);
      }
    });
    return () => unsubscribe();
  }, [watch]);

  return (
    <FlexLayout className="gap-4 flex-col">
      <FlexLayout className="gap-4">
        <Box className="flex-1">
          <FormSingleSelect
            isSearchable
            label="Vrsta palete"
            name={`cargo.${index}.metadata.palleteType`}
            options={palleteOptions}
            placeholder="Odaberi vrstu palete..."
          />
        </Box>
        <Box className="flex-1">
          <FormTextInput
            label="Broj paleta"
            min="1"
            name={`cargo.${index}.metadata.palleteAmount`}
            placeholder="Unesi broj paleta"
            type="number"
          />
        </Box>
      </FlexLayout>
      <FormTextInput label="Dužni metri (LDM)" name={`cargo.${index}.ldm`} type="number" />
    </FlexLayout>
  );
};

const NonStandardCargo: React.FC<{ index: number }> = ({ index }) => {
  const { watch, setValue } = useFormContext();
  const length = watch(`cargo.${index}.metadata.length`);
  const width = watch(`cargo.${index}.metadata.width`);
  const palleteAmount = watch(`cargo.${index}.metadata.palleteAmount`);
  const isInitialMount = useRef(true);

  const ldmValue = length && width ? roundLdmValue((length * width) / 2.4) : 0;
  const hasKolete = Boolean(palleteAmount);

  const handleKoleteToggle = (checked: boolean) => {
    if (checked) {
      setValue(`cargo.${index}.metadata.palleteAmount`, 1);
    } else {
      setValue(`cargo.${index}.metadata.palleteAmount`, undefined);
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (length && width) {
      setValue(`cargo.${index}.ldm`, ldmValue);
    }
  }, [length, width, ldmValue, setValue, index]);

  return (
    <FlexLayout className="gap-4 flex-col">
      <FlexLayout className="gap-4">
        <Box className="flex-1">
          <FormTextInput
            label="Duljina (m)"
            min="0"
            name={`cargo.${index}.metadata.length`}
            placeholder="XXX"
            step="0.01"
            type="number"
          />
        </Box>
        <Box className="flex-1">
          <FormTextInput
            label="Širina (m)"
            min="0"
            name={`cargo.${index}.metadata.width`}
            placeholder="XXX"
            step="0.01"
            type="number"
          />
        </Box>
        <Box className="flex-1">
          <FormTextInput
            label="Visina (m)"
            min="0"
            name={`cargo.${index}.metadata.height`}
            placeholder="XXX"
            step="0.01"
            type="number"
          />
        </Box>
      </FlexLayout>
      <FlexLayout className="gap-4 items-center h-[96px] -my-4">
        <Checkbox label="Kolete" value={hasKolete} onChange={handleKoleteToggle} />
        {hasKolete && (
          <Box className="flex-1">
            <FormTextInput
              label="Broj paleta"
              min="1"
              name={`cargo.${index}.metadata.palleteAmount`}
              placeholder="Unesi broj paleta"
              type="number"
            />
          </Box>
        )}
      </FlexLayout>
      <FormTextInput label="Dužni metri (LDM)" name={`cargo.${index}.ldm`} type="number" />
    </FlexLayout>
  );
};
