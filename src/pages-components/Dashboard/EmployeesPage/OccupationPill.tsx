import { Pill, PillSize, type PillVariant } from '@/ui';

const occupationVariantMap: Record<string, PillVariant> = {
  ceo: 'danger',
  driver: 'success',
  manager: 'info',
  dispatcher: 'warning',
};

interface OccupationPillProps {
  occupation: string;
  text: string;
  size?: PillSize;
}

export const OccupationPill: React.FC<OccupationPillProps> = ({ text, occupation, size }) => {
  const variant = occupationVariantMap[occupation];

  return <Pill text={text} variant={variant} size={size} />;
};
