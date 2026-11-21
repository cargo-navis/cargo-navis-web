import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui';

/** Load error inside a small panel: one line + „Pokušaj ponovno” (DECISIONS §2 Empty states). */
export function RetryLine({ text, onRetry, className }: { text: string; onRetry(): void; className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm text-muted-foreground',
        className
      )}
    >
      <span className="flex items-center gap-2">
        <Icon className="text-destructive" icon="IconAlertTriangle" size="s" />
        {text}
      </span>
      <Button size="sm" variant="outline" onClick={onRetry}>
        <Icon data-icon="inline-start" icon="IconRefresh" size="s" /> Pokušaj ponovno
      </Button>
    </div>
  );
}
