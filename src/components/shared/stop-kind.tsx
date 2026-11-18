import { cn } from '@/lib/utils';
import { Icon, type IconType } from '@/ui';

/**
 * Utovar orange, istovar teal, everywhere (DECISIONS §1): label, icon and dot through the `--utovar` / `--istovar`
 * tokens. Finished stops turn grey (`done`). Labs /tokens, /order, /assign, /transports, /home, /driver.
 */
export type StopKind = 'loading' | 'unloading';

export const STOP_KIND: Record<StopKind, { label: string; icon: IconType; text: string; dot: string }> = {
  loading: { label: 'Utovar', icon: 'IconPackageImport', text: 'text-utovar', dot: 'bg-utovar-dot' },
  unloading: { label: 'Istovar', icon: 'IconPackageExport', text: 'text-istovar', dot: 'bg-istovar-dot' },
};

/** Small uppercase label with its icon: UTOVAR / ISTOVAR (the only uppercase labels in the app). */
export function StopKindLabel({
  kind,
  done = false,
  className,
}: {
  kind: StopKind;
  done?: boolean;
  className?: string;
}) {
  const style = STOP_KIND[kind];
  return (
    <span
      className={cn(
        'flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase',
        done ? 'text-muted-foreground' : style.text,
        className
      )}
    >
      <Icon icon={style.icon} size="s" />
      {style.label}
    </span>
  );
}

/** The stop's dot (timelines, legends). */
export function StopKindDot({ kind, done = false, className }: { kind: StopKind; done?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('size-2 shrink-0 rounded-full', done ? 'bg-muted-foreground/50' : STOP_KIND[kind].dot, className)}
    />
  );
}
