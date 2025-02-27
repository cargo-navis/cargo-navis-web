import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { useToggle } from 'react-use';

import { FormSingleSelect, FormTextInput } from '@/lib/components/form';
import { FormTextarea } from '@/lib/components/form/FormTextarea';
import { postalCodes } from '@/lib/mocks/postalCodes';
import { Box, Button, Divider, FlexLayout, Text, TextButton } from '@/ui';

const defaultValues = {
  orderNo: '2025/24',
  subshipments: [],
};

const clients = [
  { label: 'Gebrüder Weiss', value: 'e1b5a7f8-2f34-4a29-8c56-d8b963d034fa' },
  { label: 'Dragon Maritime', value: 'a2c4b8f9-9e76-48d3-a34b-7b934d081c32' },
  { label: 'TerraLog', value: 'f3c7e4a8-1d56-490b-8d92-fb4a8fba4d41' },
  { label: 'Meridiana Shipping Agency', value: 'b7e5c9a2-8c3d-48e2-83d6-f4c1b9a21e54' },
  { label: 'Log Adria', value: 'd8c3a1f5-7a2e-45b3-93d7-4e9a3d5c2f86' },
  { label: 'Bandic Maritime', value: 'e6f2b7a9-6f49-4b83-8d14-9c5a4e7d5b63' },
  { label: 'Jadrošped d.o.o.', value: 'a4e1b7c6-9f72-49c5-84a3-b9e3c7f4a851' },
  { label: 'Zagrebtrans d.o.o.', value: 'c3f7a8e4-1d95-49a8-8c7d-5a9b7d4c8f24' },
  { label: 'Ralu Logistika d.d.', value: 'f7a3e5b9-8d63-4f3d-8a1e-6c4e7b5a2f19' },
  { label: 'Prangl Hrvatska', value: 'b5c8e7f9-2f14-4c7e-9a3d-8f1e6b3a4d92' },
];

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
        <FlexLayout className="flex-col gap-4 w-[640px]">
          <FlexLayout as="fieldset" className="flex-col gap-5">
            <FlexLayout className="gap-4">
              <Box className="flex-1">
                <FormTextInput iconLeft="LockClosedIcon" isDisabled label="Broj naloga" name="orderNo" />
              </Box>
              <Box className="flex-1">
                <FormTextInput label="Referentni broj" name="referenceNumber" placeholder="1234" />
              </Box>
            </FlexLayout>
            <FlexLayout className="gap-4">
              <Box className="flex-1">
                <FormSingleSelect
                  isClearable
                  isSearchable
                  label="Klijent"
                  name="client"
                  options={clients}
                  placeholder="Odaberi klijenta..."
                />
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
          </FlexLayout>
          <Box className="py-4">
            <Divider />
          </Box>
          <CargoFields />
          <Box className="py-4">
            <Divider />
          </Box>
          <AddressFields />
          <SubshipmentsFields />
          <TextButton
            iconLeft="PlusIcon"
            text="Dodaj podnalog"
            variant="secondary"
            onClick={() =>
              formMethods.setValue('subshipments', [{ contractor: undefined, 'contractor-price': undefined }])
            }
          />
          <Button iconLeft="PlusIcon" isFullWidth text="Dodaj Nalog" />
        </FlexLayout>
      </FlexLayout>
    </FormProvider>
  );
};

const CargoFields = () => {
  const [isStandardCargo, setIsStandardCargo] = useToggle(true);

  return (
    <FlexLayout as="fieldset" className="flex-col gap-4">
      <Text color="text-color-3" variant="text-s-medium">
        TERET
      </Text>
      <FlexLayout className="grow gap-3">
        <Box className="flex-1">
          <FormTextInput label="LDM" name="ldm" placeholder="1.00" step="0.01" type="number" />
        </Box>
        <Box className="flex-1">
          <FormTextInput label="Težina (kg)" name="weight" placeholder="100" />
        </Box>
      </FlexLayout>
      {/* <FlexLayout className="grow gap-3">
        <Box className="flex-1">
          <FormTextInput label="LDM" name="ldm" placeholder="1.00" step="0.01" type="number" />
        </Box>
      </FlexLayout> */}
      {isStandardCargo ? (
        <Box>STANDARD</Box>
      ) : (
        <FlexLayout className="gap-4">
          <Box className="flex-1">
            <FormTextInput label="Duljina (m)" min="0" name="length" placeholder="XXX" step="0.01" type="number" />
          </Box>
          <Box className="flex-1">
            <FormTextInput label="Širina (m)" min="0" name="width" placeholder="XXX" step="0.01" type="number" />
          </Box>
          <Box className="flex-1">
            <FormTextInput label="Visina (m)" min="0" name="height" placeholder="XXX" step="0.01" type="number" />
          </Box>
        </FlexLayout>
      )}
      <FormTextInput label="Težina (kg)" name="weight" placeholder="100" />
      <FormTextarea label="Opis tereta" name="description" />
    </FlexLayout>
  );
};

const addressOptions = postalCodes.map((p) => ({
  value: p.postalCode,
  label: `${p.postalCode} ${p.city}, ${p.region}, ${p.country}`,
}));

const AddressFields = () => {
  return (
    <FlexLayout as="fieldset" className="gap-4">
      <FlexLayout className="flex-1 flex-col gap-2">
        <Text color="text-color-3" variant="text-xxs-medium">
          Adresa utovara
        </Text>
        <FlexLayout className="flex-col gap-5">
          <Box className="flex-1">
            <FormTextInput name="streetName1" placeholder="Ulica" />
          </Box>
          <Box className="flex-1">
            {/* TODO - Async backend search */}
            <FormSingleSelect
              isClearable
              isSearchable
              name="postalCode1"
              options={addressOptions}
              placeholder="Poštanski broj"
            />
          </Box>
        </FlexLayout>
      </FlexLayout>
      <FlexLayout className="flex-1 flex-col gap-2">
        <Text color="text-color-3" variant="text-xxs-medium">
          Adresa istovara
        </Text>
        <FlexLayout className="flex-col gap-5">
          <Box className="flex-1">
            <FormTextInput name="streetName2" placeholder="Ulica" />
          </Box>
          <Box className="flex-1">
            {/* TODO - Async backend search */}
            <FormSingleSelect isSearchable name="postalCode2" options={addressOptions} placeholder="Poštanski broj" />
          </Box>
        </FlexLayout>
      </FlexLayout>
    </FlexLayout>
  );
};

const contractors: any = [
  { value: 1, label: 'Cargo Transport Zagreb' },
  { value: 2, label: 'Jagić Dostava d.o.o' },
  { value: 3, label: 'Matej Cargo' },
  { value: 4, label: 'Autotransport Melnjak d.o.o' },
  { value: 5, label: 'Petko Kamion' },
  { value: 6, label: 'Petason d.o.o' },
  { value: 7, label: 'Grubeša transport d.o.o' },
];

const SubshipmentsFields = () => {
  const { watch } = useFormContext();
  const subshipments = watch('subshipments');

  return subshipments.map((sub: any) => (
    <FlexLayout
      as="fieldset"
      className="flex-col gap-4 p-2 rounded-s bg-black-alpha-10 dark:bg-white-alpha-10"
      key={sub?.id}
    >
      <FlexLayout className="gap-4">
        <FlexLayout className="gap-4 grow">
          <Box className="flex-1">
            <FormSingleSelect
              isClearable
              isSearchable
              label="Kontraktor"
              name="contractor"
              options={contractors}
              placeholder="Odaberi kontraktora..."
            />
          </Box>
          <Box className="flex-1">
            <FormTextInput
              iconLeft="CurrencyEuroIcon"
              label="Cijena (Euro)"
              min="0"
              name="contractor-price"
              placeholder="XXX"
              type="number"
            />
          </Box>
        </FlexLayout>
      </FlexLayout>
      <FlexLayout as="fieldset" className="gap-4">
        <FlexLayout className="flex-1 flex-col gap-2">
          <Text color="text-color-3" variant="text-xxs-medium">
            Adresa utovara
          </Text>
          <FlexLayout className="flex-col gap-5">
            <Box className="flex-1">
              <FormTextInput name="contractor-streetName1" placeholder="Ulica" />
            </Box>
            <Box className="flex-1">
              {/* TODO - Async backend search */}
              <FormSingleSelect
                isClearable
                isSearchable
                name="constractor-postalCode1"
                options={addressOptions}
                placeholder="Poštanski broj"
              />
            </Box>
          </FlexLayout>
        </FlexLayout>
        <FlexLayout className="flex-1 flex-col gap-2">
          <Text color="text-color-3" variant="text-xxs-medium">
            Adresa istovara
          </Text>
          <FlexLayout className="flex-col gap-5">
            <Box className="flex-1">
              <FormTextInput name="constractor-streetName2" placeholder="Ulica" />
            </Box>
            <Box className="flex-1">
              {/* TODO - Async backend search */}
              <FormSingleSelect
                isSearchable
                name="constractor-postalCode2"
                options={addressOptions}
                placeholder="Poštanski broj"
              />
            </Box>
          </FlexLayout>
        </FlexLayout>
      </FlexLayout>
    </FlexLayout>
  ));
};
