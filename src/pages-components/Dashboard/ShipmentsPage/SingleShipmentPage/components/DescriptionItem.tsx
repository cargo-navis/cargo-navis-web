import * as Collapsible from '@radix-ui/react-collapsible';
import { useState } from 'react';

import { FlexLayout, Icon, Text } from '@/ui';

export const DescriptionItem: React.FC<{ label: string; description: string | undefined }> = ({
  label,
  description,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!description) return null;

  return (
    <Collapsible.Root asChild open={isOpen} onOpenChange={setIsOpen}>
      <FlexLayout className="flex-col">
        <Collapsible.Trigger>
          <FlexLayout className="text-dark-600 dark:text-light-300 justify-start items-center gap-2">
            <Text variant="text-xs-medium">{label}</Text>
            <Icon icon={isOpen ? 'MinusIcon' : 'PlusIcon'} size="s" />
          </FlexLayout>
        </Collapsible.Trigger>
        <Collapsible.Content asChild>
          <Text className="whitespace-pre-line" color="text-color-1" variant="text-s">
            {description || '—'}
          </Text>
        </Collapsible.Content>
      </FlexLayout>
    </Collapsible.Root>
  );
};
