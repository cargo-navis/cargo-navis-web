import { palleteNameMap } from '@/lib/utils/palletes';
import { FlexLayout, Text } from '@/ui';

import type { CargoWithMetadata } from './types';

interface CargoItemProps {
  cargo: CargoWithMetadata;
  index: number;
}

export const CargoItem: React.FC<CargoItemProps> = ({ cargo, index }) => {
  return (
    <FlexLayout className="flex-col gap-2 p-4 rounded-s bg-black-alpha-10 dark:bg-white-alpha-10">
      <Text color="text-color-3" variant="text-s-medium">
        TERET {index + 1}
      </Text>
      <FlexLayout className="flex-col gap-4">
        <FlexLayout className="flex-col">
          <Text color="text-color-3" variant="text-s-medium">
            Vrsta tereta
          </Text>
          <Text variant="text-l">
            {cargo.metadata?.type === 'standard' ? 'Standardni teret' : 'Nestandardni teret'}
          </Text>
        </FlexLayout>
        {cargo.metadata?.type === 'standard' ? (
          <FlexLayout className="flex-col">
            <Text color="text-color-3" variant="text-s-medium">
              Palete
            </Text>
            <Text variant="text-l">{`${cargo.metadata.palleteAmount} x ${palleteNameMap[cargo.metadata.palleteType]}`}</Text>
          </FlexLayout>
        ) : (
          <FlexLayout className="flex-col">
            <Text color="text-color-3" variant="text-s-medium">
              Dimenzije
            </Text>
            <Text variant="text-l">{`${cargo.metadata?.length}m x ${cargo.metadata?.width}m x ${cargo.metadata?.height}m`}</Text>
          </FlexLayout>
        )}
        <FlexLayout className="flex-col">
          <Text color="text-color-3" variant="text-s-medium">
            LDM
          </Text>
          <Text variant="text-l">{cargo.ldm}</Text>
        </FlexLayout>
        <FlexLayout className="flex-col">
          <Text color="text-color-3" variant="text-s-medium">
            Težina (kg)
          </Text>
          <Text variant="text-l">{cargo.weight || '-'}</Text>
        </FlexLayout>
        <FlexLayout className="flex-col">
          <Text color="text-color-3" variant="text-s-medium">
            Opis
          </Text>
          <Text variant="text-l">{cargo.description || '-'}</Text>
        </FlexLayout>
      </FlexLayout>
    </FlexLayout>
  );
};
