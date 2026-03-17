import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';

import { FormCheckbox, FormNumberInput, FormSingleSelect } from '@/lib/components/form';
import { FormTextarea } from '@/lib/components/form/FormTextarea';
import { roundLdmValue } from '@/lib/utils/math';
import { palleteOptions, PalleteType, palleteValues } from '@/lib/utils/palletes';
import { Box, Button, Divider, FlexLayout, Icon, Text, VerticalDivider } from '@/ui';

import { CargoLoadField, CargoLoadFieldType } from './CargoLoadField';

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

    if (type === 'nonstandard') {
      setValue(`cargo.${index}.metadata.hasKolete`, false);
      setValue(`cargo.${index}.metadata.palleteAmount`, undefined);

      const length = getValues(`cargo.${index}.metadata.length`);
      const width = getValues(`cargo.${index}.metadata.width`);
      setValue(`cargo.${index}.ldm`, length && width ? roundLdmValue((length * width) / 2.4) : '');
    } else {
      const palleteType = getValues(`cargo.${index}.metadata.palleteType`) || PalleteType.Euro;
      setValue(`cargo.${index}.metadata.palleteType`, palleteType);
      setValue(`cargo.${index}.metadata.palleteAmount`, 1);
      setValue(`cargo.${index}.ldm`, roundLdmValue(palleteValues[palleteType] * 1));
    }
  };

  const removeCargo = () => {
    const currentCargo = getValues('cargo');
    const updatedCargo = currentCargo.filter((_: any, i: number) => i !== index);
    setValue('cargo', updatedCargo, { shouldDirty: true });
  };

  const cargo = watch(`cargo.${index}`);

  function setLoadData(values: any) {
    setValue(
      `cargo.${index}`,
      {
        ...cargo,
        loadingCompanyName: values.companyName,
        loadingDate: values.primaryDate,
        loadingReadyDate: values.secondaryDate,
        loadingDescription: values.description,
        loadingReference: values.loadReference,
        loadingAddress: values.address,
      },
      { shouldDirty: true, shouldTouch: true, shouldValidate: true }
    );
  }

  function setUnloadData(values: any) {
    setValue(
      `cargo.${index}`,
      {
        ...cargo,
        unloadingCompanyName: values.companyName,
        unloadingDate: values.primaryDate,
        unloadingDueDate: values.secondaryDate,
        unloadingDescription: values.description,
        unloadingReference: values.loadReference,
        unloadingAddress: values.address,
      },
      { shouldDirty: true, shouldTouch: true, shouldValidate: true }
    );
  }

  function removeLoadData() {
    setValue(
      `cargo.${index}`,
      {
        ...cargo,
        loadingCompanyName: '',
        loadingDate: '',
        loadingReadyDate: '',
        loadingDescription: '',
        loadingAddress: {},
      },
      { shouldDirty: true, shouldTouch: true, shouldValidate: true }
    );
  }

  function removeUnloadData() {
    setValue(
      `cargo.${index}`,
      {
        ...cargo,
        unloadingCompanyName: '',
        unloadingDate: '',
        unloadingReadyDate: '',
        unloadingDescription: '',
        unloadingAddress: {},
      },
      { shouldDirty: true, shouldTouch: true, shouldValidate: true }
    );
  }

  return (
    <FlexLayout
      as="fieldset"
      className="flex-col max-h-max min-w-0 gap-4 bg-dark-100 dark:bg-white-alpha-10 p-4 rounded-s"
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
        <FormTextarea label="Opis tereta" name={`cargo.${index}.description`} />
      </FlexLayout>
      <Divider />
      <FlexLayout className="gap-4">
        <CargoLoadField cargo={cargo} type={CargoLoadFieldType.Load} onChange={setLoadData} onRemove={removeLoadData} />
        <VerticalDivider />
        <CargoLoadField
          cargo={cargo}
          type={CargoLoadFieldType.Unload}
          onChange={setUnloadData}
          onRemove={removeUnloadData}
        />
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
        <Box className="w-1/2">
          <FormSingleSelect
            isSearchable
            label="Vrsta palete"
            name={`cargo.${index}.metadata.palleteType`}
            options={palleteOptions}
            placeholder="Odaberi vrstu palete..."
          />
        </Box>
        <Box className="flex-1">
          <FormNumberInput label="Broj paleta" name={`cargo.${index}.metadata.palleteAmount`} />
        </Box>
        <Box className="flex-1">
          <FormNumberInput label="Dužni metri (LDM)" name={`cargo.${index}.ldm`} />
        </Box>
      </FlexLayout>
      <Box className="flex-1">
        <FormNumberInput label="Težina (kg)" name={`cargo.${index}.weight`} rules={{ required: true }} />
      </Box>
    </FlexLayout>
  );
};

const NonStandardCargo: React.FC<{ index: number }> = ({ index }) => {
  const { watch, setValue } = useFormContext();
  const length = watch(`cargo.${index}.metadata.length`);
  const width = watch(`cargo.${index}.metadata.width`);

  const hasKoleteFieldName = `cargo.${index}.metadata.hasKolete`;
  const palleteAmountFieldName = `cargo.${index}.metadata.palleteAmount`;

  const hasKolete = watch(hasKoleteFieldName);
  const palleteAmount = watch(palleteAmountFieldName);

  const isInitialMount = useRef(true);

  const ldmValue = length && width ? roundLdmValue((length * width) / 2.4) : 0;

  useEffect(() => {
    if (hasKolete && !palleteAmount) {
      setValue(palleteAmountFieldName, 1);
    } else if (!hasKolete) {
      setValue(palleteAmountFieldName, undefined);
    }
  }, [hasKolete, palleteAmount, setValue, palleteAmountFieldName]);

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
        <FlexLayout className="gap-4 w-3/4">
          <Box className="flex-1">
            <FormNumberInput label="Duljina (m)" name={`cargo.${index}.metadata.length`} />
          </Box>
          <Box className="flex-1">
            <FormNumberInput label="Širina (m)" name={`cargo.${index}.metadata.width`} />
          </Box>
          <Box className="flex-1">
            <FormNumberInput label="Visina (m)" name={`cargo.${index}.metadata.height`} />
          </Box>
        </FlexLayout>
        <FlexLayout className="gap-4">
          <Box className="flex-1">
            <FormNumberInput label="Dužni metri (LDM)" name={`cargo.${index}.ldm`} />
          </Box>
        </FlexLayout>
      </FlexLayout>
      <Box className="flex-1">
        <FormNumberInput label="Težina (kg)" name={`cargo.${index}.weight`} rules={{ required: true }} />
      </Box>
      <FlexLayout className="gap-4 items-center h-[96px] -my-4">
        <FormCheckbox label="Kolete" name={hasKoleteFieldName} />
        {hasKolete && (
          <Box className="flex-1">
            <FormNumberInput label="Broj paleta" name={palleteAmountFieldName} />
          </Box>
        )}
      </FlexLayout>
    </FlexLayout>
  );
};
