import type { PositionEnum } from '@/lib/api';
import { positionLabelMap } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Pill, type PillSize, type PillVariant } from '@/ui';

const occupationVariantMap: Record<string, PillVariant> = {
  ceo: 'danger',
  driver: 'success',
  manager: 'info',
  dispatcher: 'warning',
};

interface OccupationPillProps {
  occupation: string;
  text: PositionEnum;
  size?: PillSize;
}

export const OccupationPill: React.FC<OccupationPillProps> = ({ text, occupation, size }) => {
  const variant = occupationVariantMap[occupation];
  const label = positionLabelMap[text];

  return <Pill text={label} variant={variant} size={size} />;
};
