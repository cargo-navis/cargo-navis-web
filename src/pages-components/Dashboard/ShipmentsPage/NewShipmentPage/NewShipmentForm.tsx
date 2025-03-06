import { FormProvider, useForm, useFormContext } from 'react-hook-form';

import { FormTextInput } from '@/lib/components/form';
import { Box, Button, Divider, FlexLayout, Text, TextButton } from '@/ui';

import AddressFields from './AddressFields';
import { CargoField } from './CargoField';
import { ClientField } from './ClientField';
import { ContractorField } from './ContractorField';
import { DispatcherField } from './DispatcherField';

interface Address {
  name: string;
  postalCodeId: string;
  countryCode?: string;
}

interface ShipmentFields {
  referenceNumber?: string;
  loadingAddress?: Address;
  unloadingAddress?: Address;
  loadingReadyDate?: string;
  loadingDate?: string;
  loadingDescription?: string;
  unloadingDate?: string;
  unloadingDueDate?: string;
  unloadingDescription?: string;
  price?: number;
  orderNo: string;
  cargo: Cargo[];
}

const defaultValues: ShipmentFields = {
  orderNo: '2025/24',
  cargo: [
    {
      weight: undefined,
      description: undefined,
      metadata: {
        type: 'standard',
        palleteType: '120x80',
        palleteAmount: 1,
      },
    },
  ],
};

export interface Cargo {
  weight?: number;
  description?: string;
  metadata: CargoMetadata;
}

type CargoType = 'standard' | 'nonstandard';

export interface CargoMetadata {
  type: CargoType;
  width?: number;
  height?: number;
  length?: number;
  palleteType?: string;
  palleteAmount?: number;
}

export const NewShipmentForm = () => {
  const formMethods = useForm<ShipmentFields>({
    defaultValues,
    mode: 'all',
  });

  const { handleSubmit } = formMethods;

  function handleFormSubmit(data: any) {
    console.log(data);
  }

  return (
    <FormProvider {...formMethods}>
      <Box as="form" className="max-w-[1400px]" onSubmit={handleSubmit(handleFormSubmit)}>
        <FlexLayout className="relative flex-col gap-7 w-full">
          <FlexLayout className="flex-row gap-7">
            <FlexLayout className="flex-1 flex-col gap-4">
              <FlexLayout as="fieldset" className="flex-col gap-5">
                <FlexLayout className="gap-4">
                  <Box className="flex-1">
                    <FormTextInput iconLeft="LockClosedIcon" isDisabled label="Broj naloga" name="orderNo" />
                  </Box>
                  <Box className="flex-1">
                    <FormTextInput label="Referentni broj" name="referenceNumber" placeholder="1234" />
                  </Box>
                </FlexLayout>
                <Box className="flex-1">
                  <ContractorField name="contractorId" />
                </Box>
                <FlexLayout className="gap-4">
                  <Box className="flex-1">
                    <ClientField />
                  </Box>
                  <Box className="flex-1">
                    <FormTextInput
                      iconLeft="CurrencyEuroIcon"
                      label="Cijena (Euro)"
                      min="0"
                      name="price"
                      placeholder="XXX"
                      type="number"
                    />
                  </Box>
                </FlexLayout>
                <Box className="flex-1">
                  <DispatcherField />
                </Box>
              </FlexLayout>
              <Box className="py-4">
                <Divider />
              </Box>
              <AddressFields />
            </FlexLayout>
            <CargoFieldList />
          </FlexLayout>
          <Box className="sticky bottom-0 bg-[#e9eded] border-t-[2px] border-dark-200 dark:border-light-700 p-4 -mx-4">
            <Button isFullWidth text="Napravi nalog" type="submit" variant="primary" />
          </Box>
        </FlexLayout>
        <ValuesPrinter />
      </Box>
    </FormProvider>
  );
};

const emptyCargoValues: Cargo = {
  weight: 0,
  description: '',
  metadata: {
    type: 'standard',
    palleteType: '120x80',
    palleteAmount: 1,
  },
};

const CargoFieldList = () => {
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
        variant="secondary"
        onClick={() => setValue('cargo', [...cargo, emptyCargoValues])}
      />
    </FlexLayout>
  );
};

const ValuesPrinter = () => {
  const { watch } = useFormContext();
  const formValues = watch();

  return (
    <Box className="fixed right-4 top-4 w-[400px] p-4 rounded-lg shadow-lg overflow-auto max-h-[90vh]">
      <Text className="mb-2" variant="text-s-medium">
        Form Data:
      </Text>
      <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(formValues, null, 2)}</pre>
    </Box>
  );
};
