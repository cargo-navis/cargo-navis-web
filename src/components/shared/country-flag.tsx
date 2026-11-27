import { cn } from '@/lib/utils';

/**
 * Country flag (flag-icons 7.5.0, `fi fi-hr`; the CSS comes from jsDelivr in src/components/Head.tsx). Fixed px sizes,
 * so flags don't grow with the big-screen root scaling. Playground components/country-flag.tsx.
 */
const SIZES = {
  xxs: 'text-[12px] rounded-[2px]',
  xs: 'text-[16px] rounded-[4px]',
  s: 'text-[20px] rounded-[4px]',
  m: 'text-[28px] rounded-[6px]',
  l: 'text-[40px] rounded-[8px]',
};

export type CountryFlagSize = keyof typeof SIZES;

export function CountryFlag({
  code,
  size = 'm',
  className,
}: {
  code: string;
  size?: CountryFlagSize;
  className?: string;
}) {
  return (
    <span
      aria-label={code.toUpperCase()}
      className={cn('fi shrink-0 bg-cover!', `fi-${code.toLowerCase()}`, SIZES[size], className)}
      role="img"
    />
  );
}
