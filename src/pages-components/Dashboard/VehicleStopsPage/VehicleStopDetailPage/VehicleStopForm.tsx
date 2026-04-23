import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';

import { PostalCodeSelectField } from '@/components/postalCodes/PostalCodeSelectField';
import type { Cargo, Vehicle } from '@/lib/api';
import type { Employee } from '@/lib/api/employees.d';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { FormDatepicker, FormSingleSelect, FormTextInput } from '@/lib/components/form';
import { useCreateVehicleStop, useDispatchers, useDrivers, useTrailers, useUpdateVehicleStop } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { countryEuropeOptions } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Box, Button, FlexLayout, Icon, Text, TextButton, VerticalDivider } from '@/ui';

import { CargoSelectDrawer } from './CargoSelectDrawer';

import {
  getCreateDefaultsFromPreviousStop,
  getVehicleStopFormDefaults,
  type VehicleStopFormValues,
  vehicleStopSchema,
} from './schema';

interface VehicleStopFormProps {
  vehicleId: string;
  stop?: VehicleStop;
  previousStop?: VehicleStop;
  onSuccess(): void;
  onDirtyChange?(isDirty: boolean): void;
}

export const VehicleStopForm = ({ vehicleId, stop, previousStop, onSuccess, onDirtyChange }: VehicleStopFormProps) => {
  const isEditMode = !!stop;

  const { data: drivers = [] } = useDrivers();
  const { data: dispatchers = [] } = useDispatchers();
  const { trailers = [] } = useTrailers();

  const { mutateAsync: createStop, isPending: isCreating } = useCreateVehicleStop();
  const { mutateAsync: updateStop, isPending: isUpdating } = useUpdateVehicleStop();

  const formMethods = useForm<VehicleStopFormValues>({
    defaultValues: stop ? getVehicleStopFormDefaults(stop) : getCreateDefaultsFromPreviousStop(previousStop),
    resolver: yupResolver(vehicleStopSchema) as any,
    mode: 'onChange',
  });

  const { handleSubmit, formState } = formMethods;

  const [loadingDrawerOpen, setLoadingDrawerOpen] = useState(false);
  const [unloadingDrawerOpen, setUnloadingDrawerOpen] = useState(false);
  const [loadingCargos, setLoadingCargos] = useState<Cargo[]>([]);
  const [unloadingCargos, setUnloadingCargos] = useState<Cargo[]>([]);

  useEffect(() => {
    onDirtyChange?.(formState.isDirty);
  }, [formState.isDirty, onDirtyChange]);

  const driverOptions = drivers.map((d: Employee) => ({ value: d.id, label: d.fullName }));
  const dispatcherOptions = dispatchers.map((d: Employee) => ({ value: d.id, label: d.fullName }));
  const trailerOptions = trailers.map((t: Vehicle) => ({ value: t.id, label: t.registration }));

  async function handleFormSubmit(values: VehicleStopFormValues) {
    const payload = {
      address: {
        streetName: values.address.streetName,
        postalCodeId: values.address.addressPostalCode.value as string,
      },
      date: values.date || null,
      driverId: values.driverId || null,
      trailerId: values.trailerId || null,
      disponentId: values.disponentId || null,
    };

    try {
      if (isEditMode) {
        await updateStop({ id: stop.id, data: payload });
        showSuccessToast({ title: 'Stanica ažurirana' });
      } else {
        await createStop({ vehicleId, previousStopId: previousStop?.id ?? null, ...payload });
        showSuccessToast({ title: 'Stanica kreirana' });
      }
      onSuccess();
    } catch {
      showErrorToast({ title: isEditMode ? 'Greška s ažuriranjem stanice' : 'Greška s kreiranjem stanice' });
    }
  }

  return (
    <FormProvider {...formMethods}>
      <FlexLayout as="form" className="flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
        <FormTextInput autoFocus label="Ulica i broj" name="address.streetName" rules={{ required: true }} />
        <FlexLayout className="gap-4">
          <Box className="flex-1">
            <FormSingleSelect
              isSearchable
              label="Država"
              name="address.countryCode"
              options={countryEuropeOptions}
              rules={{ required: true }}
            />
          </Box>
          <Box className="flex-1">
            <PostalCodeField />
          </Box>
        </FlexLayout>
        <FormDatepicker label="Datum" name="date" />
        <FlexLayout className="gap-4">
          <Box className="flex-1">
            <FormSingleSelect isClearable isSearchable label="Vozač" name="driverId" options={driverOptions} />
          </Box>
          <Box className="flex-1">
            <FormSingleSelect
              isClearable
              isSearchable
              label="Disponent"
              name="disponentId"
              options={dispatcherOptions}
            />
          </Box>
        </FlexLayout>
        <FormSingleSelect isClearable isSearchable label="Prikolica" name="trailerId" options={trailerOptions} />
        <FlexLayout className="items-start gap-6 mt-2">
          <FlexLayout className="flex-1 flex-col gap-2">
            <TextButton
              iconLeft="ArrowRightEndOnRectangleIcon"
              text={loadingCargos.length > 0 ? `Utovari (${loadingCargos.length})` : 'Utovari'}
              variant="secondary"
              onClick={() => setLoadingDrawerOpen(true)}
            />
            <SelectedCargoList
              cargos={loadingCargos}
              onRemove={(id) => setLoadingCargos((prev) => prev.filter((c) => c.id !== id))}
            />
          </FlexLayout>
          <VerticalDivider />
          <FlexLayout className="flex-1 flex-col gap-2">
            <TextButton
              iconLeft="ArrowRightStartOnRectangleIcon"
              text={unloadingCargos.length > 0 ? `Istovari (${unloadingCargos.length})` : 'Istovari'}
              variant="secondary"
              onClick={() => setUnloadingDrawerOpen(true)}
            />
            <SelectedCargoList
              cargos={unloadingCargos}
              onRemove={(id) => setUnloadingCargos((prev) => prev.filter((c) => c.id !== id))}
            />
          </FlexLayout>
        </FlexLayout>
        <Box className="mt-4">
          <Button
            isDisabled={!formState.isValid || (isEditMode && !formState.isDirty)}
            isFullWidth
            isLoading={isCreating || isUpdating}
            text={isEditMode ? 'Spremi promjene' : 'Spremi stanicu'}
          />
        </Box>
      </FlexLayout>
      <CargoSelectDrawer
        addressType="loading"
        isOpen={loadingDrawerOpen}
        selected={loadingCargos}
        title="Utovari"
        onConfirm={setLoadingCargos}
        onOpenChange={setLoadingDrawerOpen}
      />
      <CargoSelectDrawer
        addressType="unloading"
        isOpen={unloadingDrawerOpen}
        selected={unloadingCargos}
        title="Istovari"
        onConfirm={setUnloadingCargos}
        onOpenChange={setUnloadingDrawerOpen}
      />
    </FormProvider>
  );
};

const SelectedCargoList = ({ cargos, onRemove }: { cargos: Cargo[]; onRemove(id: string): void }) => {
  if (cargos.length === 0) return null;

  return (
    <FlexLayout className="flex-col gap-1">
      {cargos.map((cargo) => (
        <FlexLayout
          className="items-center justify-between gap-2 rounded-m border border-dark-100 dark:border-light-800 px-3 py-2"
          key={cargo.id}
        >
          <FlexLayout className="flex-col">
            <FlexLayout className="items-center gap-1">
              <Icon icon="CubeIcon" size="s" />
              <Text color="text-color-1" variant="text-xs-medium">
                {cargo.description || '-'}
              </Text>
            </FlexLayout>
            <Text color="text-color-4" variant="text-xxs">
              {cargo.weight} kg
            </Text>
          </FlexLayout>
          <Box as="button" className="text-color-4 hover:text-color-1" type="button" onClick={() => onRemove(cargo.id)}>
            <Icon icon="XMarkIcon" />
          </Box>
        </FlexLayout>
      ))}
    </FlexLayout>
  );
};

const PostalCodeField = () => {
  const { watch } = useFormContext();
  const countryCode = watch('address.countryCode');

  return (
    <PostalCodeSelectField
      countryCode={countryCode}
      iconLeft="MagnifyingGlassIcon"
      isClearable
      isDisabled={!countryCode}
      label="Poštanski broj"
      name="address.addressPostalCode"
      placeholder="Odaberi poštanski broj"
      rules={{ required: true }}
    />
  );
};
