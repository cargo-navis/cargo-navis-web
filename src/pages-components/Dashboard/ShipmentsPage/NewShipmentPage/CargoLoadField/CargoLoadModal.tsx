import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import * as Yup from 'yup';

import { PostalCodeSelectField } from '@/components/postalCodes/PostalCodeSelectField';
import { FormDatepicker, FormSingleSelect, FormTextarea, FormTextInput } from '@/lib/components/form';
import { countryEuropeOptions } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Box, Button, Dialog, DialogContent, DialogHeader, DialogTitle, FlexLayout, Icon, VerticalDivider } from '@/ui';

import { getAddressSchema, getRequiredDateSchema } from '../schema';
import { CargoLoadFieldType, typeLabelsMap } from './CargoLoadField';
import { useFormFocusOverride, usePostalCodeFieldFocusOverride } from './hooks';

const cargoLoadSchema = Yup.object().shape({
  address: getAddressSchema({ message: 'Adresa je obavezna' }),
  companyName: Yup.string().optional(),
  primaryDate: getRequiredDateSchema({ message: 'Datum je obavezan' }),
  secondaryDate: Yup.string().optional(),
  loadReference: Yup.string().optional(),
  description: Yup.string().optional(),
});

interface CargoLoadModalProps {
  isOpen: boolean;
  initialValues: any;
  type: CargoLoadFieldType;
  onClose(): void;
  onSubmit(values: any): void; // todo - any fix
}

export const CargoLoadModal: React.FC<CargoLoadModalProps> = ({ isOpen, onClose, ...rest }) => {
  const { title } = typeLabelsMap[rest.type];

  return (
    <Dialog open={isOpen}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-[800px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex-row items-center justify-between">
          <DialogTitle className="font-medium">{title}</DialogTitle>
          <Icon icon="XMarkIcon" onClick={onClose} />
        </DialogHeader>
        <CargoLoadForm {...rest} />
      </DialogContent>
    </Dialog>
  );
};

const CargoLoadForm = ({ type, initialValues, onSubmit }: Omit<CargoLoadModalProps, 'isOpen' | 'onClose'>) => {
  const formMethods = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(cargoLoadSchema),
  });
  const { handleSubmit } = formMethods;
  const { isValid } = formMethods.formState;

  const { formRef, handleTabChange } = useFormFocusOverride();

  function handleFormSubmit(values: any) {
    onSubmit(values);
  }

  const { primaryDateLabel, secondaryDateLabel, companyLabel, ctaLabel, loadReferenceLabel } = typeLabelsMap[type];

  return (
    <FormProvider {...formMethods}>
      <FlexLayout
        as="form"
        className="flex-col gap-4"
        ref={formRef}
        onKeyDown={handleTabChange}
        onSubmit={(e) => {
          e.stopPropagation();
          void handleSubmit(handleFormSubmit)(e);
        }}
      >
        <FlexLayout className="gap-4 grow">
          <FlexLayout className="flex-col gap-4 flex-1">
            <Box className="flex-1">
              <FormTextInput autoFocus label={companyLabel} name="companyName" />
            </Box>
            <Box className="flex-1">
              <FormDatepicker label={primaryDateLabel} name="primaryDate" rules={{ required: true }} />
            </Box>
            <Box className="flex-1">
              <FormDatepicker label={secondaryDateLabel} name="secondaryDate" />
            </Box>
          </FlexLayout>
          <VerticalDivider />
          <FlexLayout className="flex-col gap-4 flex-1">
            <Box className="flex-1">
              <FormTextInput label="Ulica i broj" name="address.streetName" rules={{ required: true }} />
            </Box>
            <Box className="flex-1">
              <FormSingleSelect
                isSearchable
                label="Država"
                name="address.countryCode"
                options={countryEuropeOptions}
                rules={{ required: true }}
              />
            </Box>
            <PostalCodeField />
          </FlexLayout>
        </FlexLayout>
        <FormTextInput label={loadReferenceLabel} name="loadReference" />
        <FormTextarea label="Napomena" name="description" />
        <Box className="mt-4 isolate">
          <Button isDisabled={!isValid} isFullWidth text={ctaLabel} />
        </Box>
      </FlexLayout>
    </FormProvider>
  );
};

const PostalCodeField = () => {
  const { watch } = useFormContext();
  const loadingCountryCode = watch(`address.countryCode`);

  const { postalCodeFieldRef, handleMenuOpen, handleMenuClose } = usePostalCodeFieldFocusOverride();

  return (
    <Box className="flex-1">
      <PostalCodeSelectField
        countryCode={loadingCountryCode}
        iconLeft="MagnifyingGlassIcon"
        isClearable
        isDisabled={!loadingCountryCode}
        label="Poštanski broj"
        name="address.postalCodeId"
        placeholder="Odaberi poštanski broj"
        ref={postalCodeFieldRef}
        rules={{ required: true }}
        onMenuClose={handleMenuClose}
        onMenuOpen={handleMenuOpen}
      />
    </Box>
  );
};
