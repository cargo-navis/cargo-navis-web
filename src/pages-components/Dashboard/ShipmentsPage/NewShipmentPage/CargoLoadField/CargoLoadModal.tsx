import { yupResolver } from '@hookform/resolvers/yup';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import * as Yup from 'yup';

import { PostalCodeSelectField } from '@/components/postalCodes/PostalCodeSelectField';
import { FormDatepicker, FormSingleSelect, FormTextarea, FormTextInput } from '@/lib/components/form';
import { countryEuropeOptions } from '@/pages-components/Dashboard/NewEmployeePage/const';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  FlexLayout,
  Icon,
  VerticalDivider,
} from '@/ui';

import { cargoLoadUnloadDatesMessage, getAddressSchema } from '../schema';
import { CargoLoadFieldType, typeLabelsMap } from './CargoLoadField';
import { useFormFocusOverride, usePostalCodeFieldFocusOverride } from './hooks';

function buildCargoLoadSchema(
  type: CargoLoadFieldType,
  cargo?: { loadingReadyDate?: string; unloadingDueDate?: string }
) {
  return Yup.object().shape({
    address: getAddressSchema({ message: 'Adresa je obavezna' }),
    companyName: Yup.string().optional(),
    date: Yup.string()
      .optional()
      .test('load-unload-order', cargoLoadUnloadDatesMessage, function (dateVal) {
        if (!String(dateVal ?? '').trim()) return true;
        const d = dayjs(dateVal);
        if (!d.isValid()) return true;
        if (type === CargoLoadFieldType.Load) {
          const due = cargo?.unloadingDueDate?.trim();
          if (!due) return true;
          const dueD = dayjs(due);
          if (!dueD.isValid()) return true;
          return !d.isAfter(dueD, 'day');
        }
        const ready = cargo?.loadingReadyDate?.trim();
        if (!ready) return true;
        const readyD = dayjs(ready);
        if (!readyD.isValid()) return true;
        return !d.isBefore(readyD, 'day');
      }),
    loadReference: Yup.string().optional(),
    description: Yup.string().optional(),
  });
}

interface CargoLoadModalProps {
  isOpen: boolean;
  initialValues: any;
  type: CargoLoadFieldType;
  /** Peer dates on the cargo row for calendar bounds and validation */
  cargo?: { loadingReadyDate?: string; unloadingDueDate?: string };
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
          <Icon icon="IconX" onClick={onClose} />
        </DialogHeader>
        <CargoLoadForm
          key={
            isOpen
              ? `${rest.type}-${rest.cargo?.loadingReadyDate ?? ''}-${rest.cargo?.unloadingDueDate ?? ''}`
              : 'closed'
          }
          {...rest}
        />
      </DialogContent>
    </Dialog>
  );
};

const CargoLoadForm = ({ type, initialValues, cargo, onSubmit }: Omit<CargoLoadModalProps, 'isOpen' | 'onClose'>) => {
  const cargoLoadSchema = useMemo(() => buildCargoLoadSchema(type, cargo), [type, cargo]);

  const minDateForPicker =
    type === CargoLoadFieldType.Unload ? cargo?.loadingReadyDate?.trim() || undefined : undefined;
  const maxDateForPicker = type === CargoLoadFieldType.Load ? cargo?.unloadingDueDate?.trim() || undefined : undefined;

  const formMethods = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(cargoLoadSchema),
    mode: 'onChange',
  });
  const { handleSubmit } = formMethods;
  const { isValid } = formMethods.formState;

  const { formRef, handleTabChange } = useFormFocusOverride();

  function handleFormSubmit(values: any) {
    onSubmit(values);
  }

  const { dateLabel, companyLabel, ctaLabel, loadReferenceLabel } = typeLabelsMap[type];

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
              <FormDatepicker label={dateLabel} maxDate={maxDateForPicker} minDate={minDateForPicker} name="date" />
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
        iconLeft="IconSearch"
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
