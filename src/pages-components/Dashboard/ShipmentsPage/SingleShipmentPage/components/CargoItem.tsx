import { palleteNameMap } from '@/lib/utils/palletes';
import { FlexLayout, Text } from '@/ui';

import type { CargoWithMetadata } from './types';

interface CargoItemProps {
  cargo: CargoWithMetadata;
  index: number;
}

export const CargoItem: React.FC<CargoItemProps> = ({ cargo, index }) => {
  const isStandardCargo = cargo.metadata?.type === 'standard';

  return (
    <FlexLayout className="flex-col gap-4 p-4 rounded-s bg-black-alpha-05 dark:bg-white-alpha-10">
      <FlexLayout className="flex-col">
        <Text color="text-color-3" variant="text-s-medium">
          TERET {index + 1}
        </Text>
        <Text color="text-color-3" variant="text-s">
          {isStandardCargo ? 'Standardni teret' : 'Nestandardni teret'}
        </Text>
      </FlexLayout>
      <FlexLayout className="flex-col gap-4">
        {isStandardCargo ? <StandardContent cargo={cargo} /> : <NonstandardContent cargo={cargo} />}
        <FlexLayout className="flex-col">
          <Text color="text-color-3" variant="text-xs-medium">
            Opis tereta
          </Text>
          <Text className="whitespace-pre-line" color="text-color-1" variant="text-s">
            {cargo.description || '—'}
          </Text>
        </FlexLayout>
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
