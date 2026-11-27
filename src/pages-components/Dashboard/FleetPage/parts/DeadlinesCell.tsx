import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Vehicle } from '@/lib/api';

import { deadlineSummary, expiredWord, problemsOf, soonWord } from '../fleet';

/**
 * „Rokovi” column (lab /fleet): „Sve u roku” green dot, otherwise one badge („2 istekla · 1 uskoro” red, „1 istječe
 * uskoro” amber). The tooltip names them, so the list answers „what?” without opening the vehicle.
 */
export function DeadlinesCell({ vehicle }: { vehicle: Vehicle }) {
  const { expired, soon } = problemsOf(vehicle);
  const list = [...expired, ...soon];

  if (list.length === 0) {
    return (
      <Badge look="dot" tone="success">
        Sve u roku
      </Badge>
    );
  }

  const badge =
    expired.length > 0 ? (
      <Badge tone="danger">
        {expired.length} {expiredWord(expired.length)}
        {soon.length > 0 && ` · ${soon.length} uskoro`}
      </Badge>
    ) : (
      <Badge tone="warning">
        {soon.length} {soonWord(soon.length)} uskoro
      </Badge>
    );

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>{badge}</TooltipTrigger>
      <TooltipContent className="flex flex-col items-start gap-0.5">
        {list.map((deadline) => (
          <span key={deadline.key}>{deadlineSummary(deadline)}</span>
        ))}
      </TooltipContent>
    </Tooltip>
  );
}
