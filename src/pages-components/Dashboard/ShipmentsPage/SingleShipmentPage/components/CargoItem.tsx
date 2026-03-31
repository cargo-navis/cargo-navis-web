import { getDataPointDateString } from '@/lib/utils/date';
import { palleteNameMap } from '@/lib/utils/palletes';
import { Collapsible, DisplayIf, Divider, FlexLayout, Icon, Text, VerticalDivider } from '@/ui';

import { AddressDetailsItem } from './AddressDetailsItem';
import type { CargoWithMetadata } from './types';

interface CargoItemProps {
  cargo: CargoWithMetadata;
  index: number;
}

export const CargoItem: React.FC<CargoItemProps> = ({ cargo, index }) => {
  const isStandardCargo = cargo.metadata?.type === 'standard';

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

  const hasDimensions = [length, width, height].some((d) => !!d);
  const dimensionsString = hasDimensions
    ? [length, width, height].map((d) => (d != null ? d + 'm' : '—')).join(' x ')
    : '—';

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
    <FlexLayout as="section" className="justify-between gap-4">
      <FlexLayout className="flex-1 flex-col gap-4 min-w-0">
        <FlexLayout className="gap-2 items-center">
          <Text
            className="underline underline-offset-2 decoration-2 decoration-teal-600 dark:decoration-teal-500"
            color="text-color-1"
            variant="text-s-medium"
          >
            Detalji utovara
          </Text>
          <Icon icon="ArrowRightEndOnRectangleIcon" />
        </FlexLayout>
        <FlexLayout className="flex-col gap-4 flex-1">
          <FlexLayout className="gap-4 justify-between items-start">
            <FlexLayout className="flex-col">
              <Text color="text-color-3" variant="text-xs-medium">
                Datum spremnog utovara
              </Text>
              <Text color="text-color-1" variant="text-s">
                {getDataPointDateString(cargo.loadingReadyDate)}
              </Text>
            </FlexLayout>
            <DisplayIf condition={!!cargo.loadingReference}>
              <FlexLayout className="flex-col text-end">
                <Text color="text-color-3" variant="text-xs-medium">
                  Referenca utovara
                </Text>
                <Text color="text-color-1" variant="text-s">
                  {cargo.loadingReference}
                </Text>
              </FlexLayout>
            </DisplayIf>
          </FlexLayout>
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
        <Collapsible description={cargo.loadingDescription} label="Napomena" />
      </FlexLayout>
      <VerticalDivider />
      <FlexLayout className="flex-1 flex-col gap-4 min-w-0">
        <FlexLayout className="gap-2 items-center">
          <Text
            className="underline underline-offset-2 decoration-2 decoration-teal-600 dark:decoration-teal-500"
            color="text-color-1"
            variant="text-s-medium"
          >
            Detalji istovara
          </Text>
          <Icon icon="ArrowRightStartOnRectangleIcon" />
        </FlexLayout>
        <FlexLayout className="flex-col gap-4 flex-1">
          <FlexLayout className="gap-4 justify-between items-start">
            <FlexLayout className="flex-col">
              <Text color="text-color-3" variant="text-xs-medium">
                Rok za istovar
              </Text>
              <Text color="text-color-1" variant="text-s">
                {getDataPointDateString(cargo.unloadingDueDate)}
              </Text>
            </FlexLayout>
            <DisplayIf condition={!!cargo.unloadingReference}>
              <FlexLayout className="flex-col text-end">
                <Text color="text-color-3" variant="text-xs-medium">
                  Referenca istovara
                </Text>
                <Text color="text-color-1" variant="text-s">
                  {cargo.unloadingReference}
                </Text>
              </FlexLayout>
            </DisplayIf>
          </FlexLayout>
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
        <Collapsible description={cargo.unloadingDescription} label="Napomena" />
      </FlexLayout>
    </FlexLayout>
  );
};
