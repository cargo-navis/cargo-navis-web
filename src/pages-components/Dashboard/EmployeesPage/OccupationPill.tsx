import { Pill, type PillVariant } from '@/ui';

const occupationVariantMap: Record<string, PillVariant> = {
  ceo: 'danger',
  driver: 'success',
  manager: 'info',
  dispatcher: 'warning',
};

interface OccupationPillProps {
  occupation: string;
  text: string;
}

export const OccupationPill: React.FC<OccupationPillProps> = ({ text, occupation }) => {
  const variant = occupationVariantMap[occupation];

  return <Pill text={text} variant={variant} />;
};
