import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';

import { ClientName } from '@/components/clients/ClientName';
import { PostalCodeSelectField } from '@/components/postalCodes/PostalCodeSelectField';
import type { Cargo, Vehicle } from '@/lib/api';
import type { Employee } from '@/lib/api/employees.d';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { FormDatepicker, FormSingleSelect, FormTextInput } from '@/lib/components/form';
import { useCreateVehicleStops, useDispatchers, useDrivers, useTrailers, useUpdateVehicleStop } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, Button, FlexLayout, Icon, Text, TextButton, VerticalDivider } from '@/ui';

import { countryEuropeOptions } from '../../NewEmployeePage/const';
import { buildAddressKey, formatPostalCodeLabel } from './addressHelpers';
import { AddressSearchSelect, type SelectedAddress } from './AddressSearchSelect';
import { CargoSelectDrawer, CargoWithClient } from './CargoSelectDrawer';
import {
  getCreateDefaultsFromPreviousStop,
  getVehicleStopFormDefaults,
  type VehicleStopFormValues,
  vehicleStopSchema,
} from './schema';
import { useCargoSelection } from './useCargoSelection';

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

  const { mutateAsync: createStop, isPending: isCreating } = useCreateVehicleStops();
  const { mutateAsync: updateStop, isPending: isUpdating } = useUpdateVehicleStop();

  const formMethods = useForm<VehicleStopFormValues>({
    defaultValues: stop ? getVehicleStopFormDefaults(stop) : getCreateDefaultsFromPreviousStop(previousStop),
    resolver: yupResolver(vehicleStopSchema) as any,
    mode: 'onChange',
  });

  const { handleSubmit, formState, setValue, watch } = formMethods;

  const [loadingDrawerOpen, setLoadingDrawerOpen] = useState(false);
  const [unloadingDrawerOpen, setUnloadingDrawerOpen] = useState(false);
  const [selectedAddressKey, setSelectedAddressKey] = useState<string>(() =>
    stop?.address ? buildAddressKey(stop.id, stop.address.postalCodeId) : ''
  );
  const [isCustomAddress, setIsCustomAddress] = useState(false);

  const { loadingCargos, unloadingCargos, setCargos } = useCargoSelection(setValue);

  const loadingCargoIds = watch('loadingCargoIds');
  const unloadingCargoIds = watch('unloadingCargoIds');

  const setFieldValue = (name: Parameters<typeof setValue>[0], value: unknown) =>
    setValue(name, value as never, { shouldDirty: true, shouldValidate: true });

  const handleLoadingCargosChange = (cargos: Cargo[]) => setCargos('loading', cargos);
  const handleUnloadingCargosChange = (cargos: Cargo[]) => setCargos('unloading', cargos);

  function resetAddressAndCargos() {
    setFieldValue('address.streetName', '');
    setFieldValue('address.countryCode', '');
    setFieldValue('address.addressPostalCode', {});
    setCargos('loading', []);
    setCargos('unloading', []);
  }

  function handleAddressChange(picked: SelectedAddress | null) {
    if (!picked) {
      setSelectedAddressKey('');
      return resetAddressAndCargos();
    }

    const addressKey = buildAddressKey(picked.shipmentId, picked.address.postalCodeId);
    setSelectedAddressKey(addressKey);

    const streetName = picked.address.streetName ?? '';
    setFieldValue('address.streetName', streetName);

    const countryCode = picked.address.countryCode ?? '';
    setFieldValue('address.countryCode', countryCode);

    const postalCode = { value: picked.address.postalCodeId, label: formatPostalCodeLabel(picked.address) };
    setFieldValue('address.addressPostalCode', postalCode);

    setCargos('loading', picked.loadingCargos);
    setCargos('unloading', picked.unloadingCargos);
  }

  function toggleCustomAddress() {
    setIsCustomAddress((prev) => !prev);
    setSelectedAddressKey('');
    resetAddressAndCargos();
  }

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
      loadingCargoIds: values.loadingCargoIds,
      unloadingCargoIds: values.unloadingCargoIds,
    };

    try {
      if (isEditMode) {
        await updateStop({ id: stop.id, data: payload });
        showSuccessToast({ title: 'Stanica ažurirana' });
      } else {
        await createStop([{ vehicleId, previousStopId: previousStop?.id ?? null, ...payload }]);
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
        {isCustomAddress ? (
          <>
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
          </>
        ) : (
          <AddressSearchSelect stop={stop} value={selectedAddressKey} onChange={handleAddressChange} />
        )}
        <FlexLayout className="-mt-2">
          <TextButton
            iconLeft={isCustomAddress ? 'IconSearch' : undefined}
            size="s"
            text={isCustomAddress ? 'Pretraži adrese' : 'Prilagođena adresa?'}
            type="button"
            variant="secondary"
            onClick={toggleCustomAddress}
          />
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
              iconLeft="IconPackageImport"
              text={loadingCargoIds.length > 0 ? `Utovari (${loadingCargoIds.length})` : 'Utovari'}
              type="button"
              variant="secondary"
              onClick={() => setLoadingDrawerOpen(true)}
            />
            <SelectedCargoList
              cargos={loadingCargos}
              onRemove={(id) => handleLoadingCargosChange(loadingCargos.filter((c) => c.id !== id))}
            />
          </FlexLayout>
          <VerticalDivider />
          <FlexLayout className="flex-1 flex-col gap-2">
            <TextButton
              iconLeft="IconPackageExport"
              text={unloadingCargoIds.length > 0 ? `Istovari (${unloadingCargoIds.length})` : 'Istovari'}
              type="button"
              variant="secondary"
              onClick={() => setUnloadingDrawerOpen(true)}
            />
            <SelectedCargoList
              cargos={unloadingCargos}
              onRemove={(id) => handleUnloadingCargosChange(unloadingCargos.filter((c) => c.id !== id))}
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
        onConfirm={handleLoadingCargosChange}
        onOpenChange={setLoadingDrawerOpen}
      />
      <CargoSelectDrawer
        addressType="unloading"
        isOpen={unloadingDrawerOpen}
        selected={unloadingCargos}
        title="Istovari"
        onConfirm={handleUnloadingCargosChange}
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
            <ClientName color="text-color-3" id={(cargo as CargoWithClient).clientId} variant="text-xxs" />
            <FlexLayout className="gap-1">
              <Icon className="mt-1" icon="IconPackage" size="s" />
              <Text color="text-color-1" variant="text-xs-medium">
                {cargo.description || '-'}
              </Text>
            </FlexLayout>
          </FlexLayout>
          <Box as="button" className="text-color-4 hover:text-color-1" type="button" onClick={() => onRemove(cargo.id)}>
            <Icon icon="IconX" />
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
      iconLeft="IconSearch"
      isClearable
      isDisabled={!countryCode}
      label="Poštanski broj"
      name="address.addressPostalCode"
      placeholder="Odaberi poštanski broj"
      rules={{ required: true }}
    />
  );
};
