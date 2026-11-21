import { Spinner } from '@/components/ui/spinner';

/** Full-page loading screen: a spinner centred on the page background. */
export const LoadingPage = () => {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background text-muted-foreground">
      <Spinner className="size-6" />
    </div>
  );
};
