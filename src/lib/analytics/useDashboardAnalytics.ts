import * as React from 'react';

import { useCurrentTenant, useCurrentUser } from '@/lib/hooks';

import { identifyUser, initAnalytics } from '.';

/** In the dashboard shell: start PostHog (dashboard pages only) and tag the user with their company once both load. */
export function useDashboardAnalytics() {
  const { data: user } = useCurrentUser();
  const { data: tenant } = useCurrentTenant();

  React.useEffect(() => {
    initAnalytics();
  }, []);

  React.useEffect(() => {
    if (user) identifyUser(user, tenant);
  }, [user, tenant]);
}
