import { useState } from 'react';

import { getDataPointDateString } from '@/lib/utils/date';
import { getCountryFromCode } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Box, Collapsible, DisplayIf, Divider, FlexLayout, Text, TextButton } from '@/ui';

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
    primaryDateLabel: 'Datum utovara',
    secondaryDateLabel: 'spremno za utovar',
    addLabel: 'Dodijeli utovar',
    ctaLabel: 'Potvrdi utovar',
    fieldNames: {
      companyName: 'loadingCompanyName',
      primaryDate: 'loadingDate',
      secondaryDate: 'loadingReadyDate',
      description: 'loadingDescription',
      address: 'loadingAddress',
    },
  },
  [CargoLoadFieldType.Unload]: {
    title: 'Detalji istovara',
    companyLabel: 'Tvrtka istovara',
    primaryDateLabel: 'Datum istovara',
    secondaryDateLabel: 'krajnji rok za istovar',
    addLabel: 'Dodijeli istovar',
    ctaLabel: 'Potvrdi istovar',
    fieldNames: {
      companyName: 'unloadingCompanyName',
      primaryDate: 'unloadingDate',
      secondaryDate: 'unloadingDueDate',
      description: 'unloadingDescription',
      address: 'unloadingAddress',
    },
  },
};

interface CargoLoadFieldProps {
  cargo: any;
  type: CargoLoadFieldType;
  onChange(values: any): void;
  onRemove(): void;
}

export const CargoLoadField: React.FC<CargoLoadFieldProps> = ({ cargo, type, onChange, onRemove }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const { title, primaryDateLabel, secondaryDateLabel, companyLabel, addLabel, fieldNames } = typeLabelsMap[type];

  const initialValues = {
    companyName: cargo[fieldNames.companyName],
    primaryDate: cargo[fieldNames.primaryDate],
    secondaryDate: cargo[fieldNames.secondaryDate],
    description: cargo[fieldNames.description],
    address: cargo[fieldNames.address],
  };

  const hasCargoLoads = useHasCargoLoads();

  return (
    <>
      {!initialValues.address?.streetName ? (
        <FlexLayout className="items-center gap-4">
          <Box className="flex-1">
            <TextButton iconLeft="PlusIcon" text={addLabel} type="button" variant="primary" onClick={openModal} />
          </Box>
          <DisplayIf condition={hasCargoLoads}>
            <Box className="flex-1">
              <Divider text="Ili" />
            </Box>
            <Box className="w-1/2 shrink-0">
              <LoadSelect onChange={onChange} />
            </Box>
          </DisplayIf>
        </FlexLayout>
      ) : (
        <FlexLayout className="relative flex-col gap-4 before:block before:absolute before:top-0 before:-bottom-[4px] before:-left-[16px] before:w-[4px] before:bg-teal-600 dark:before:bg-teal-500 before:rounded-tr-l before:rounded-br-l">
          <FlexLayout className="gap-2 items-center">
            <Text color="text-color-1" variant="text-s-medium">
              {title}
            </Text>
            <TextButton
              iconLeft="PencilSquareIcon"
              size="s"
              text="Uredi"
              type="button"
              variant="secondary"
              onClick={openModal}
            />
            <TextButton iconLeft="XMarkIcon" size="s" text="Ukloni" type="button" variant="danger" onClick={onRemove} />
          </FlexLayout>
          <FlexLayout className="flex-col gap-4 flex-1">
            <FlexLayout className="flex-col">
              <Text color="text-color-3" variant="text-xs-medium">
                {primaryDateLabel} {initialValues.secondaryDate ? `(${secondaryDateLabel})` : null}
              </Text>
              <Text color="text-color-1" variant="text-s">
                {getDataPointDateString(initialValues.primaryDate)}{' '}
                {initialValues.secondaryDate ? `(${getDataPointDateString(initialValues.secondaryDate)})` : null}
              </Text>
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
              <AddressDisplay address={initialValues.address} />
            </FlexLayout>
          </FlexLayout>
          <Collapsible description={initialValues.description} label="Napomena" />
        </FlexLayout>
      )}
      <CargoLoadModal
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
    <FlexLayout className="flex-col gap-1 text-end">
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
