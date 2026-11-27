import { cn } from '@/lib/utils';
import { Icon } from '@/ui';

/**
 * Playground components/ui/spinner.tsx through the app's `@/ui` Icon: a span sized like the playground's svg
 * (`size-4`, override with e.g. `className="size-5"`), the icon fills it.
 */
function Spinner({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-label="Učitavanje"
      className={cn('inline-flex size-4 shrink-0 animate-spin [&_svg]:size-full! [&>div]:size-full!', className)}
      data-slot="spinner"
      role="status"
      {...props}
    >
      <Icon icon="IconLoader" size="s" />
    </span>
  );
}

export { Spinner };
