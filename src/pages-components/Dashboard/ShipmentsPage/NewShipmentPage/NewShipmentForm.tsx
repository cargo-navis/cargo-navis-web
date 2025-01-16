import { FormSingleSelect, FormTextInput } from '@/lib/components/form';
import { FormTextarea } from '@/lib/components/form/FormTextarea';
import { Box, Divider, FlexLayout, Text, TextButton } from '@/ui';
import { FormProvider, useForm } from 'react-hook-form';

const defaultValues = {
  orderNo: '2025/24',
};

export const NewShipmentForm = () => {
  const formMethods = useForm<any>({
    defaultValues,
    mode: 'all',
  });

  const { handleSubmit } = formMethods;

  function handleFormSubmit(data: any) {
    console.log(data);
  }

  return (
    <FormProvider {...formMethods}>
      <FlexLayout as="form" className="flex-col gap-[40px]" onSubmit={handleSubmit(handleFormSubmit)}>
        <FlexLayout className="flex-col gap-4 w-[520px]">
          <FlexLayout as="fieldset" className="flex-col gap-5">
            <FlexLayout className="gap-4">
              <Box className="flex-1">
                <FormTextInput iconLeft="LockClosedIcon" name="orderNo" label="Broj naloga" isDisabled />
              </Box>
              <Box className="flex-1">
                <FormTextInput name="referenceNumber" label="Referentni broj" placeholder="1234" />
              </Box>
            </FlexLayout>
            <FlexLayout className="gap-4">
              <Box className="flex-1">
                <FormSingleSelect
                  label="Klijent"
                  name="client"
                  isSearchable
                  options={[]}
                  placeholder="Odaberi klijenta..."
                />
              </Box>
              <Box className="flex-1">
                <FormTextInput
                  iconLeft="CurrencyEuroIcon"
                  name="price"
                  label="Cijena (Euro)"
                  placeholder="XXX"
                  type="number"
                  min="0"
                />
              </Box>
            </FlexLayout>
          </FlexLayout>
          <Box className="py-4">
            <Divider />
          </Box>
          <CargoFields />
          <Box className="py-4">
            <Divider />
          </Box>
          <AddressFields />
          <TextButton iconLeft="PlusIcon" text="Dodaj podnalog" variant="secondary" />
        </FlexLayout>
      </FlexLayout>
    </FormProvider>
  );
};

const CargoFields = () => {
  return (
    <FlexLayout as="fieldset" className="flex-col gap-4">
      <Text color="text-color-3" variant="text-s-medium">
        TERET
      </Text>
      <FlexLayout className="grow gap-3">
        <Box className="flex-1">
          <FormTextInput name="ldm" placeholder="1.00" label="LDM" type="number" step="0.01" />
        </Box>
        <Box className="flex-1">
          <FormTextInput name="weight" placeholder="100" label="Težina (kg)" />
        </Box>
      </FlexLayout>
      <FormTextInput name="length" placeholder="X" label="Duljina (m)" />
      <FormTextInput name="width" placeholder="X" label="Širina (m)" />
      <FormTextInput name="height" placeholder="X" label="Visina (m)" />
      <FormTextarea name="description" label="Opis tereta" />
    </FlexLayout>
  );
};

const AddressFields = () => {
  return (
    <FlexLayout as="fieldset" className="gap-4">
      <FlexLayout className="flex-1 flex-col gap-2">
        <Text color="text-color-3" variant="text-xxs-medium">
          Adresa utovara
        </Text>
        <FlexLayout className="flex-col gap-5">
          <Box className="flex-1">
            <FormTextInput name="streetName" placeholder="Ulica" />
          </Box>
          <Box className="flex-1">
            <FormSingleSelect name="postalCode1" isSearchable placeholder="Poštanski broj" options={[]} />
          </Box>
        </FlexLayout>
      </FlexLayout>
      <FlexLayout className="flex-1 flex-col gap-2">
        <Text color="text-color-3" variant="text-xxs-medium">
          Adresa istovara
        </Text>
        <FlexLayout className="flex-col gap-5">
          <Box className="flex-1">
            <FormTextInput name="streetName" placeholder="Ime ulice" />
          </Box>
          <Box className="flex-1">
            <FormSingleSelect name="postalCode2" isSearchable placeholder="Poštanski broj" options={[]} />
          </Box>
        </FlexLayout>
      </FlexLayout>
    </FlexLayout>
  );
};
