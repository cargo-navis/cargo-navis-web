import { FlexLayout, Icon, Text } from '@/ui';
import { Tooltip } from '@/ui/components/Tooltip/Tooltip';

interface ParticipationHeaderProps {
  basis: string;
  label: string;
  tooltip: string;
}

export const ParticipationHeader = ({ basis, label, tooltip }: ParticipationHeaderProps) => (
  <FlexLayout className={`${basis} items-center justify-end gap-1`}>
    <Text color="text-color-2" variant="text-s-medium">
      {label}
    </Text>
    <Tooltip
      content={
        <Text className="px-1" color="text-light-50" variant="text-xxs">
          {tooltip}
        </Text>
      }
      isPortal
    >
      <Icon className="text-color-2 cursor-help" icon="IconInfoCircle" size="m" />
    </Tooltip>
  </FlexLayout>
);
