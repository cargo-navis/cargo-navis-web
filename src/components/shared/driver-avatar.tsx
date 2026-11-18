import { cn } from '@/lib/utils';
import { driverToneClasses } from '@/lib/utils/driverTone';
import { initials } from '@/lib/utils/initials';
import { Icon } from '@/ui';

/**
 * A driver's initials in their colour (FNV-1a of the employee id → `--driver-1…5`, DECISIONS §1); red dashed with a
 * person icon when there's no driver. Use it wherever a driver appears (Prijevozi, Dodijeli vozilo, Nalozi Vozač).
 * Lab /transports.
 */
export function DriverAvatar({
  driverId,
  name,
  size = 'md',
  className,
}: {
  driverId?: string | null;
  /** Full name; initials are taken from it. */
  name?: string | null;
  /** sm 24px · md 28px (lab) · lg 32px. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const tone = driverToneClasses(driverId);
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold',
        size === 'sm' && 'size-6 text-[0.625rem]',
        size === 'md' && 'size-7 text-[0.6875rem]',
        size === 'lg' && 'size-8 text-xs',
        tone.avatar,
        className
      )}
    >
      {driverId && name ? initials(name) : <Icon className="size-3.5! [&_svg]:size-full!" icon="IconUser" size="xs" />}
    </span>
  );
}
