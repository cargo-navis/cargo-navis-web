import { LoadStatus } from '@/lib/api';
import { useUpdateCargo } from '@/lib/hooks';
import { getDataPointDateString } from '@/lib/utils/date';
import { palleteNameMap } from '@/lib/utils/palletes';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { loadStatusConfig } from '@/pages-components/Dashboard/ShipmentsPage/const';
import { Collapsible, DisplayIf, Divider, FlexLayout, Icon, Text } from '@/ui';

import { AddressDetailsItem } from './AddressDetailsItem';
import { LoadStatusProgress } from './LoadStatusProgress';
import type { CargoWithMetadata } from './types';

interface CargoItemProps {
  cargo: CargoWithMetadata;
  index: number;
  shipmentId: string;
}

export const CargoItem: React.FC<CargoItemProps> = ({ cargo, index, shipmentId }) => {
  const isStandardCargo = cargo.metadata?.type === 'standard';

  const { mutateAsync: updateCargo, isPending } = useUpdateCargo(shipmentId);

  const handleLoadStatusChange = async (status: LoadStatus) => {
    try {
      await updateCargo({
        id: cargo.id,
        loadStatus: status,
      });

      const statusText = loadStatusConfig[status].label;

      showSuccessToast({ title: 'Status tereta ažuriran:', description: statusText.toUpperCase() });
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Greška prilikom ažuriranja statusa utovara. Pokušajte ponovno.' });
    }
  };

  return (
    <FlexLayout className="flex-col gap-4 p-4 rounded-s bg-black-alpha-05 dark:bg-white-alpha-10">
      <FlexLayout className="justify-between items-center">
        <FlexLayout className="flex-col">
          <Text color="text-color-1" variant="text-s-medium">
            TERET {index + 1}
          </Text>
          <Text color="text-color-3" variant="text-s">
            {isStandardCargo ? 'Standardni teret' : 'Nestandardni teret'}
          </Text>
        </FlexLayout>
        <LoadStatusProgress
          currentStatus={cargo.loadStatus || LoadStatus.NotYetLoaded}
          isPending={isPending}
          size="s"
          onStatusChange={handleLoadStatusChange}
        />
      </FlexLayout>
      <FlexLayout className="flex-col gap-4">
        {isStandardCargo ? <StandardContent cargo={cargo} /> : <NonstandardContent cargo={cargo} />}
        <DisplayIf condition={!!cargo.description}>
          <Collapsible description={cargo.description} label="Opis tereta" />
        </DisplayIf>
        <Divider />
        <LoadingFields cargo={cargo} />
      </FlexLayout>
    </FlexLayout>
  );
};

const StandardContent = ({ cargo }: { cargo: CargoWithMetadata }) => {
  const palleteName = palleteNameMap[cargo.metadata?.palleteType];
  const amount = cargo.metadata?.palleteAmount;
  const paletteString = amount + ' x ' + palleteName;

  return (
    <FlexLayout className="justify-between gap-4">
      <FlexLayout className="flex-col">
        <Text color="text-color-3" variant="text-xs-medium">
          Palete
        </Text>
        <Text color="text-color-1" variant="text-m">
          {paletteString}
        </Text>
      </FlexLayout>
      <FlexLayout className="flex-col">
        <Text color="text-color-3" variant="text-xs-medium">
          LDM
        </Text>
        <Text color="text-color-1" variant="text-m">
          {cargo.ldm || '—'}
        </Text>
      </FlexLayout>
      <FlexLayout className="flex-col text-end">
        <Text color="text-color-3" variant="text-xs-medium">
          Težina (kg)
        </Text>
        <Text color="text-color-1" variant="text-m">
          {cargo.weight || '—'}
        </Text>
      </FlexLayout>
    </FlexLayout>
  );
};

const NonstandardContent = ({ cargo }: { cargo: CargoWithMetadata }) => {
  const length = cargo.metadata?.length;
  const width = cargo.metadata?.width;
  const height = cargo.metadata?.height;

  const dimensionsString = [length, width, height].map((d) => d + 'm').join(' x ');

  return (
    <FlexLayout className="justify-between gap-4">
      <FlexLayout className="flex-col">
        <Text color="text-color-3" variant="text-xs-medium">
          Dimenzije
        </Text>
        <Text color="text-color-1" variant="text-m">
          {dimensionsString}
        </Text>
      </FlexLayout>
      {cargo.metadata?.palleteAmount && (
        <FlexLayout className="flex-col">
          <Text color="text-color-3" variant="text-xs-medium">
            Palete
          </Text>
          <Text color="text-color-1" variant="text-m">
            {cargo.metadata.palleteAmount}
          </Text>
        </FlexLayout>
      )}
      <FlexLayout className="flex-col">
        <Text color="text-color-3" variant="text-xs-medium">
          LDM
        </Text>
        <Text color="text-color-1" variant="text-m">
          {cargo.ldm || '—'}
        </Text>
      </FlexLayout>
      <FlexLayout className="flex-col text-end">
        <Text color="text-color-3" variant="text-xs-medium">
          Težina (kg)
        </Text>
        <Text color="text-color-1" variant="text-m">
          {cargo.weight || '—'}
        </Text>
      </FlexLayout>
    </FlexLayout>
  );
};

const LoadingFields = ({ cargo }: { cargo: CargoWithMetadata }) => {
  return (
    <FlexLayout as="section" className="flex-col gap-4">
      <FlexLayout className="relative flex-col gap-4 before:block before:absolute before:top-0 before:-bottom-[4px] before:-left-[16px] before:w-[4px] before:bg-teal-600 dark:before:bg-teal-500 before:rounded-tr-l before:rounded-br-l">
        <FlexLayout className="gap-2 items-center">
          <Text color="text-color-1" variant="text-s-medium">
            Detalji utovara
          </Text>
          <Icon icon="ArrowRightEndOnRectangleIcon" />
        </FlexLayout>
        <FlexLayout className="flex-col gap-4 flex-1">
          <FlexLayout className="flex-col">
            <Text color="text-color-3" variant="text-xs-medium">
              Datum utovara {cargo.loadingReadyDate ? '(spremno za utovar)' : null}
            </Text>
            <Text color="text-color-1" variant="text-s">
              {getDataPointDateString(cargo.loadingDate)}{' '}
              {cargo.loadingReadyDate ? `(${getDataPointDateString(cargo.loadingReadyDate)})` : null}
            </Text>
          </FlexLayout>
          <FlexLayout className="justify-between items-start">
            <FlexLayout className="flex-col">
              <Text color="text-color-3" variant="text-xs-medium">
                Tvrtka utovara
              </Text>
              <Text color="text-color-1" variant="text-s">
                {cargo.loadingCompanyName || '—'}
              </Text>
            </FlexLayout>
            <AddressDetailsItem address={cargo.loadingAddress} />
          </FlexLayout>
          <DisplayIf condition={!!cargo.loadingReference}>
            <FlexLayout className="flex-col">
              <Text color="text-color-3" variant="text-xs-medium">
                Referenca utovara
              </Text>
              <Text color="text-color-1" variant="text-s">
                {cargo.loadingReference}
              </Text>
            </FlexLayout>
          </DisplayIf>
        </FlexLayout>
        <Collapsible description={cargo.loadingDescription} label="Napomena" />
      </FlexLayout>
      <Divider />
      <FlexLayout className="relative flex-col gap-4 before:block before:absolute before:top-0 before:-bottom-[4px] before:-left-[16px] before:w-[4px] before:bg-teal-600 dark:before:bg-teal-500 before:rounded-tr-l before:rounded-br-l">
        <FlexLayout className="gap-2 items-center">
          <Text color="text-color-1" variant="text-s-medium">
            Detalji istovara
          </Text>
          <Icon icon="ArrowRightStartOnRectangleIcon" />
        </FlexLayout>
        <FlexLayout className="flex-col gap-4 flex-1">
          <FlexLayout className="flex-col">
            <Text color="text-color-3" variant="text-xs-medium">
              Datum istovara {cargo.unloadingDueDate ? '(rok za istovar)' : null}
            </Text>
            <Text color="text-color-1" variant="text-s">
              {getDataPointDateString(cargo.unloadingDate)}{' '}
              {cargo.unloadingDueDate ? `(${getDataPointDateString(cargo.unloadingDueDate)})` : null}
            </Text>
          </FlexLayout>
          <FlexLayout className="justify-between items-start">
            <FlexLayout className="flex-col">
              <Text color="text-color-3" variant="text-xs-medium">
                Tvrtka istovara
              </Text>
              <Text color="text-color-1" variant="text-s">
                {cargo.unloadingCompanyName || '—'}
              </Text>
            </FlexLayout>
            <AddressDetailsItem address={cargo.unloadingAddress} />
          </FlexLayout>
          <DisplayIf condition={!!cargo.unloadingReference}>
            <FlexLayout className="flex-col">
              <Text color="text-color-3" variant="text-xs-medium">
                Referenca istovara
              </Text>
              <Text color="text-color-1" variant="text-s">
                {cargo.unloadingReference}
              </Text>
            </FlexLayout>
          </DisplayIf>
        </FlexLayout>
        <Collapsible description={cargo.unloadingDescription} label="Napomena" />
      </FlexLayout>
    </FlexLayout>
  );
};
