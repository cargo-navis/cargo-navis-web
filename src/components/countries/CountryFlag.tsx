import clsx from 'clsx';

import { Box } from '@/ui';

type CountryFlagSize = 's' | 'm' | 'l';

const sizesMap: Record<CountryFlagSize, { fontSize: string; radius: string }> = {
  s: { fontSize: 'text-[20px]', radius: 'rounded-xs' },
  m: { fontSize: 'text-[28px]', radius: 'rounded-s' },
  l: { fontSize: 'text-[40px]', radius: 'rounded-m' },
};

interface CountryFlagProps {
  code: string;
  size?: CountryFlagSize;
}

/** flag-icons keys its classes off the lowercased ISO 3166-1 alpha-2 code. */
export const CountryFlag: React.FC<CountryFlagProps> = ({ code, size = 'm' }) => {
  const { fontSize, radius } = sizesMap[size];

  return <Box as="span" className={clsx('fi shrink-0', `fi-${code.toLowerCase()}`, fontSize, radius)} />;
};
