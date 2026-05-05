import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { getDataPointDateString } from '@/lib/utils/date';
import { getCountryFromCode } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Collapsible, DisplayIf, Divider, FlexLayout, Text, TextButton } from '@/ui';

import { useHasCargoLoads } from '../hooks/useHasCargoLoads';
import { CargoLoadModal } from './CargoLoadModal';
import { LoadSelect } from './LoadSelect';

export enum CargoLoadFieldType {
  Load,
  Unload,
}

export const typeLabelsMap = {
  [CargoLoadFieldType.Load]: {
    title: 'Detalji utovara',
    companyLabel: 'Tvrtka utovara',
    dateLabel: 'Spremno za utovar',
    loadReferenceLabel: 'Referenca utovara',
    addLabel: 'Dodijeli utovar',
    ctaLabel: 'Potvrdi utovar',
    fieldNames: {
      companyName: 'loadingCompanyName',
      date: 'loadingReadyDate',
      description: 'loadingDescription',
      loadReference: 'loadingReference',
      address: 'loadingAddress',
    },
  },
  [CargoLoadFieldType.Unload]: {
    title: 'Detalji istovara',
    companyLabel: 'Tvrtka istovara',
    dateLabel: 'Krajnji rok za istovar',
    loadReferenceLabel: 'Referenca istovara',
    addLabel: 'Dodijeli istovar',
    ctaLabel: 'Potvrdi istovar',
    fieldNames: {
      companyName: 'unloadingCompanyName',
      date: 'unloadingDueDate',
      loadReference: 'unloadingReference',
      description: 'unloadingDescription',
      address: 'unloadingAddress',
    },
  },
};

interface CargoLoadFieldProps {
  cargoIndex: number;
  cargo: any;
  type: CargoLoadFieldType;
  onChange(values: any): void;
  onRemove(): void;
}

export const CargoLoadField: React.FC<CargoLoadFieldProps> = ({ cargoIndex, cargo, type, onChange, onRemove }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    formState: { errors },
  } = useFormContext();
  const dateFieldKey = typeLabelsMap[type].fieldNames.date as 'loadingReadyDate' | 'unloadingDueDate';
  const dateError = errors.cargo?.[cargoIndex]?.[dateFieldKey]?.message as string | undefined;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const { title, dateLabel, loadReferenceLabel, companyLabel, addLabel, fieldNames } = typeLabelsMap[type];

  const initialValues = {
    companyName: cargo[fieldNames.companyName],
    date: cargo[fieldNames.date],
    loadReference: cargo[fieldNames.loadReference],
    description: cargo[fieldNames.description],
    address: cargo[fieldNames.address],
  };

  const hasCargoLoads = useHasCargoLoads();

  return (
    <>
      {!initialValues.address?.streetName ? (
        <FlexLayout className="min-w-0 flex-1 flex-col justify-center gap-4">
          <TextButton iconLeft="IconPlus" text={addLabel} type="button" variant="primary" onClick={openModal} />
          <DisplayIf condition={hasCargoLoads}>
            <Divider text="Ili" />
            <LoadSelect onChange={onChange} />
          </DisplayIf>
        </FlexLayout>
      ) : (
        <FlexLayout className="flex-1 flex-col gap-4 min-w-0">
          <FlexLayout className="gap-2 items-center">
            <Text
              className="underline underline-offset-2 decoration-2 decoration-teal-600 dark:decoration-teal-500"
              color="text-color-1"
              variant="text-s-medium"
            >
              {title}
            </Text>
            <TextButton
              iconLeft="IconEdit"
              size="s"
              text="Uredi"
              type="button"
              variant="secondary"
              onClick={openModal}
            />
            <TextButton iconLeft="IconX" size="s" text="Ukloni" type="button" variant="danger" onClick={onRemove} />
          </FlexLayout>
          <FlexLayout className="flex-col gap-4 flex-1">
            <FlexLayout className="justify-between gap-4">
              <FlexLayout className="flex-col">
                <Text color="text-color-3" variant="text-xs-medium">
                  {dateLabel}
                </Text>
                <Text color="text-color-1" variant="text-s">
                  {getDataPointDateString(initialValues.date)}
                </Text>
                {dateError ? (
                  <Text className="text-red-600 dark:text-red-500" variant="text-xs-medium">
                    {dateError}
                  </Text>
                ) : null}
              </FlexLayout>
              <DisplayIf condition={!!initialValues.loadReference}>
                <FlexLayout className="flex-col text-end">
                  <Text color="text-color-3" variant="text-xs-medium">
                    {loadReferenceLabel}
                  </Text>
                  <Text color="text-color-1" variant="text-s">
                    {initialValues.loadReference}
                  </Text>
                </FlexLayout>
              </DisplayIf>
            </FlexLayout>
            <FlexLayout className="justify-between items-start">
              <FlexLayout className="flex-col">
                <Text color="text-color-3" variant="text-xs-medium">
                  {companyLabel}
                </Text>
                <Text color="text-color-1" variant="text-s">
                  {initialValues.companyName || '—'}
                </Text>
              </FlexLayout>
            </FlexLayout>
            <AddressDisplay address={initialValues.address} />
          </FlexLayout>
          <Collapsible description={initialValues.description} label="Napomena" />
        </FlexLayout>
      )}
      <CargoLoadModal
        cargo={cargo}
        initialValues={initialValues}
        isOpen={isModalOpen}
        type={type}
        onClose={closeModal}
        onSubmit={(values) => {
          onChange(values);
          closeModal();
        }}
      />
    </>
  );
};

const AddressDisplay = ({ address }: { address: any }) => {
  const addressString: string[] = [];
  if (address.postalCodeId) addressString.push(address.postalCodeId.label);
  if (address.countryCode) addressString.push(getCountryFromCode(address?.countryCode || '')?.name);

  return (
    <FlexLayout className="flex-col gap-1">
      <Text color="text-color-3" variant="text-xs-medium">
        Adresa
      </Text>
      <FlexLayout className="flex-col">
        <Text color="text-color-1" variant="text-s">
          {address.streetName}
        </Text>
        <Text color="text-color-1" variant="text-s">
          {addressString.join(', ')}
        </Text>
      </FlexLayout>
    </FlexLayout>
  );
};
