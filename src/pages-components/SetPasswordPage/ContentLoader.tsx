import { Skeleton } from '@/components/ui/skeleton';

/** Form placeholder while the router reads the link (first render): two fields and the button. */
export const ContentLoader = () => (
  <div aria-busy="true" className="flex flex-col gap-6">
    <div className="flex flex-col gap-4">
      {[0, 1].map((index) => (
        <div className="flex flex-col gap-2" key={index}>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
    <Skeleton className="h-10 w-full rounded-lg" />
  </div>
);
