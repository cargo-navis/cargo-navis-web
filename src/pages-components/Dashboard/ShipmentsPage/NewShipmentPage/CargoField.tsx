import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { FormSingleSelect, FormTextInput } from '@/lib/components/form';
import { FormTextarea } from '@/lib/components/form/FormTextarea';
import { Box, Button, FlexLayout, Icon, Text } from '@/ui';

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
    setValue('cargo', updatedCargo);
  };

  return (
    <FlexLayout as="fieldset" className="flex-col gap-4 bg-black-alpha-10 dark:bg-white-alpha-10 p-4 rounded-s">
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
        <FormTextInput label="Težina (kg)" name={`cargo.${index}.weight`} />
        <FormTextarea label="Opis tereta" name={`cargo.${index}.description`} />
      </FlexLayout>
    </FlexLayout>
  );
};

const palleteOptions = [
  { value: '80x60', label: 'Mala Paleta (80x60)' },
  { value: '120x80', label: 'Euro Paleta (120x80)' },
  { value: '120x100', label: 'Brodska Paleta (120x100)' },
  { value: '100x100', label: 'Industrijska Paleta (100x100)' },
  { value: '120x120', label: 'Jumbo Paleta (120x120)' },
];

const palleteValues: Record<string, number> = {
  '80x60': 0.2,
  '120x80': 0.4,
  '120x100': 0.5,
  '100x100': 0.4,
  '120x120': 0.6,
};

const StandardCargo: React.FC<{ index: number }> = ({ index }) => {
  const { watch, setValue } = useFormContext();
  const palleteType = watch(`cargo.${index}.metadata.palleteType`);
  const palleteAmount = watch(`cargo.${index}.metadata.palleteAmount`);

  const ldmValue = palleteType && palleteAmount ? palleteValues[palleteType] * palleteAmount : 0;

  useEffect(() => {
    setValue(`cargo.${index}.metadata.ldm`, ldmValue);
  }, [ldmValue, setValue, index]);

  return (
    <FlexLayout className="gap-4 flex-col">
      <FlexLayout className="gap-4">
        <Box className="flex-1">
          <FormSingleSelect
            isClearable
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
      <FormTextInput isDisabled label="Dužni metri (LDM)" name={`cargo.${index}.metadata.ldm`} type="number" />
    </FlexLayout>
  );
};

const NonStandardCargo: React.FC<{ index: number }> = ({ index }) => {
  const { watch, setValue } = useFormContext();
  const length = watch(`cargo.${index}.metadata.length`);
  const width = watch(`cargo.${index}.metadata.width`);

  const ldmValue = length && width ? (length * width) / 2.4 : 0;

  useEffect(() => {
    setValue(`cargo.${index}.metadata.ldm`, ldmValue);
  }, [ldmValue, setValue, index]);

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
      <FormTextInput label="Dužni metri (LDM)" name={`cargo.${index}.metadata.ldm`} type="number" />
    </FlexLayout>
  );
};
