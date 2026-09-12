import { Alert, Button, FlexLayout } from '@/ui';

import { INVALID_LINK_MESSAGE } from './const';

export const InvalidLinkAlert = () => (
  <FlexLayout className="flex-col gap-5">
    <Alert icon="IconAlertTriangle" text={INVALID_LINK_MESSAGE} title="Link nije valjan" variant="warning" />
    <FlexLayout className="justify-end">
      <Button as="a" href="/login" iconLeft="IconArrowLeft" text="Natrag na prijavu" variant="secondary" />
    </FlexLayout>
  </FlexLayout>
);
