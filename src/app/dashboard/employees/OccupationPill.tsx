import { Pill, PillVariant } from '@/ui';

const occupationVariantMap: Record<string, PillVariant> = {
  driver: 'success',
  manager: 'info',
  disponent: 'warning',
};

interface OccupationPillProps {
  occupation: string;
  text: string;
}

export const OccupationPill: React.FC<OccupationPillProps> = ({ text, occupation }) => {
  const variant = occupationVariantMap[occupation];

  return (
    <Pill text={text} variant={variant} />
  )
};