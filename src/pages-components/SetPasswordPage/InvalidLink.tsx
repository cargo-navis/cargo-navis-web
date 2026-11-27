import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Icon } from '@/ui';

import { INVALID_LINK_MESSAGE } from './const';

/** Shown in the card instead of the form: no token in the link, or the backend rejected it (used or expired). */
export const InvalidLink = () => (
  <Empty className="min-h-0 p-0 pt-2">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Icon icon="IconLinkOff" size="m" />
      </EmptyMedia>
      <EmptyTitle>Link nije valjan</EmptyTitle>
      <EmptyDescription>{INVALID_LINK_MESSAGE}</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button nativeButton={false} render={<Link href="/login" />} variant="outline">
        <Icon data-icon="inline-start" icon="IconArrowLeft" size="s" /> Natrag na prijavu
      </Button>
    </EmptyContent>
  </Empty>
);
