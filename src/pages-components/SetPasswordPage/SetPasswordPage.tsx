import { useRouter } from 'next/router';
import * as React from 'react';

import { AuthHeader, AuthLayout } from '@/components/layout/AuthLayout';
import { Skeleton } from '@/components/ui/skeleton';

import { ContentLoader } from './ContentLoader';
import { InvalidLink } from './InvalidLink';
import { SetPasswordForm } from './SetPasswordForm';

const TITLE = 'Postavi lozinku';

/** Invite link `/set-password?token=…&email=…`: set the first password, then on to Prijava. */
export const SetPasswordPage = () => {
  const { isReady, query } = useRouter();
  // The backend rejected the token (used, expired or malformed).
  const [linkRejected, setLinkRejected] = React.useState(false);

  const token = typeof query.token === 'string' ? query.token : '';
  const email = typeof query.email === 'string' ? query.email : '';

  let content: React.ReactNode;
  if (!isReady) {
    content = (
      <>
        <AuthHeader description={<Skeleton className="my-0.5 h-4 w-3/4" />} title={TITLE} />
        <ContentLoader />
      </>
    );
  } else if (!token || linkRejected) {
    content = <InvalidLink />;
  } else {
    content = (
      <>
        <AuthHeader
          description={
            email ? (
              <>
                Postavite lozinku za račun: <span className="font-medium break-all text-foreground">{email}</span>
              </>
            ) : (
              'Postavite lozinku za svoj račun'
            )
          }
          title={TITLE}
        />
        <SetPasswordForm email={email} token={token} onLinkRejected={() => setLinkRejected(true)} />
      </>
    );
  }

  return <AuthLayout pageTitle={TITLE}>{content}</AuthLayout>;
};
