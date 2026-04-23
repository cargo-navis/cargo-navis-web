import { useEffect, useState } from 'react';

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Box, Button, FlexLayout, Icon, Text } from '@/ui';

export interface CargoItem {
  id: string;
  description: string;
  weight: number;
}

const CARGO_TYPES = [
  'Paleta EUR',
  'Paleta industrijska',
  'Sanduk',
  'Vreća',
  'Bala',
  'Kontejner 20ft',
  'Kontejner 40ft',
  'Bubanj',
  'Kanta',
  'Kutija',
];

const DUMMY_CARGOS: CargoItem[] = Array.from({ length: 50 }, (_, i) => {
  const type = CARGO_TYPES[i % CARGO_TYPES.length];
  return {
    id: String(i + 1),
    description: `${type} #${i + 1}`,
    weight: 25 + ((i * 37) % 2500),
  };
});

interface CargoSelectDrawerProps {
  isOpen: boolean;
  title: string;
  selected: CargoItem[];
  onOpenChange(isOpen: boolean): void;
  onConfirm(cargos: CargoItem[]): void;
}

export const CargoSelectDrawer = ({ isOpen, title, selected, onOpenChange, onConfirm }: CargoSelectDrawerProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(selected.map((c) => c.id)));

  useEffect(() => {
    if (isOpen) setSelectedIds(new Set(selected.map((c) => c.id)));
  }, [isOpen, selected]);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    onConfirm(DUMMY_CARGOS.filter((c) => selectedIds.has(c.id)));
    onOpenChange(false);
  }

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <Text color="text-color-1" variant="text-m-medium">
            {title}
          </Text>
          <Text color="text-color-4" variant="text-xs">
            Odaberi terete
          </Text>
        </DrawerHeader>
        <Box className="flex-1 overflow-y-auto px-4">
          <FlexLayout className="flex-col gap-2">
            {DUMMY_CARGOS.map((cargo) => {
              const isSelected = selectedIds.has(cargo.id);
              return (
                <FlexLayout
                  as="button"
                  className={`items-center justify-between gap-3 rounded-m border p-3 text-left ${
                    isSelected
                      ? 'border-teal-500 bg-teal-500/10'
                      : 'border-dark-100 hover:border-teal-500/70 dark:border-light-800'
                  }`}
                  key={cargo.id}
                  type="button"
                  onClick={() => toggle(cargo.id)}
                >
                  <FlexLayout className="flex-col">
                    <Text color="text-color-1" variant="text-s-medium">
                      {cargo.description}
                    </Text>
                    <Text color="text-color-3" variant="text-xxs">
                      {cargo.weight} kg
                    </Text>
                  </FlexLayout>
                  {isSelected && <Icon className="text-teal-500" icon="CheckIcon" size="m" />}
                </FlexLayout>
              );
            })}
          </FlexLayout>
        </Box>
        <DrawerFooter>
          <Button isFullWidth text={`Potvrdi (${selectedIds.size})`} onClick={handleConfirm} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
