import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';

import { FlexLayout } from '@/ui';

import { DRIVER_HEADER_HEIGHT } from './DriverHeader';

interface StickySectionHeaderProps {
  children: React.ReactNode;
  isExpanded?: boolean;
  onClick?(): void;
}

/**
 * Full-width section title that sticks right below the fixed DriverHeader within its section and gets a shadow
 * once stuck. Sitting 1px under the header's edge makes a stuck title 1px out of the observed area.
 */
export const StickySectionHeader: React.FC<StickySectionHeaderProps> = ({ children, isExpanded, onClick }) => {
  const ref = useRef<HTMLElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(entry.intersectionRatio < 1 && entry.boundingClientRect.top < DRIVER_HEADER_HEIGHT),
      { rootMargin: `-${DRIVER_HEADER_HEIGHT}px 0px 0px 0px`, threshold: [1] }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <FlexLayout
      aria-expanded={onClick ? isExpanded : undefined}
      as={onClick ? 'button' : 'div'}
      className={clsx(
        'sticky top-[51px] z-10 -mx-4 h-[44px] items-center gap-1 bg-dark-50 px-4 transition-shadow duration-200 dark:bg-light-900',
        isStuck && 'shadow-[0_6px_8px_-6px_rgba(18,22,39,0.25)] dark:shadow-[0_6px_8px_-6px_rgba(0,0,0,0.7)]'
      )}
      ref={ref}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
    >
      {children}
    </FlexLayout>
  );
};
