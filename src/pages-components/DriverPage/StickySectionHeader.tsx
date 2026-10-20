import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';

import { FlexLayout } from '@/ui';

interface StickySectionHeaderProps {
  children: React.ReactNode;
  isExpanded?: boolean;
  onClick?(): void;
}

/**
 * Full-width section title that sticks to the top within its section and gets a shadow once stuck.
 * Sitting at `top: -1px` makes a stuck header 1px out of view, which the observer picks up.
 */
export const StickySectionHeader: React.FC<StickySectionHeaderProps> = ({ children, isExpanded, onClick }) => {
  const ref = useRef<HTMLElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(entry.intersectionRatio < 1 && entry.boundingClientRect.top < 0),
      { threshold: [1] }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <FlexLayout
      aria-expanded={onClick ? isExpanded : undefined}
      as={onClick ? 'button' : 'div'}
      className={clsx(
        'sticky top-[-1px] z-10 -mx-4 h-[44px] items-center gap-1 bg-dark-50 px-4 transition-shadow duration-200 dark:bg-light-900',
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
