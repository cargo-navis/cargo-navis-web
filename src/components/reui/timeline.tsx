import { Slot } from '@radix-ui/react-slot';
import { createContext, forwardRef, type HTMLAttributes, useCallback, useContext, useState } from 'react';

import { cn } from '@/lib/utils';
import { Box, FlexLayout, Text } from '@/ui';

// Types
type TimelineContextValue = {
  activeStep: number;
  setActiveStep: (step: number) => void;
};

// Context
const TimelineContext = createContext<TimelineContextValue | undefined>(undefined);

const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimeline must be used within a Timeline');
  }
  return context;
};

// Components
interface TimelineProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  orientation?: 'horizontal' | 'vertical';
}

function Timeline({
  defaultValue = 1,
  value,
  onValueChange,
  orientation = 'vertical',
  className,
  children,
  ...props
}: TimelineProps) {
  const [activeStep, setInternalStep] = useState(defaultValue);

  const setActiveStep = useCallback(
    (step: number) => {
      if (value === undefined) {
        setInternalStep(step);
      }
      onValueChange?.(step);
    },
    [value, onValueChange]
  );

  const currentStep = value ?? activeStep;

  return (
    <TimelineContext.Provider value={{ activeStep: currentStep, setActiveStep }}>
      <FlexLayout
        className={cn(
          'group/timeline data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col',
          className
        )}
        data-orientation={orientation}
        data-slot="timeline"
        {...props}
      >
        {children}
      </FlexLayout>
    </TimelineContext.Provider>
  );
}

// TimelineContent
function TimelineContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Box className={cn(className)} data-slot="timeline-content" {...props}>
      {children}
    </Box>
  );
}

// TimelineDate
interface TimelineDateProps extends HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

function TimelineDate({ asChild = false, className, children, ...props }: TimelineDateProps) {
  if (asChild) {
    return (
      <Slot className={cn('block', className)} data-slot="timeline-date" {...props}>
        {children as React.ReactElement}
      </Slot>
    );
  }

  return (
    <Text
      as="time"
      className={cn('block', className)}
      color="text-color-4"
      data-slot="timeline-date"
      variant="text-xxxs"
      {...props}
    >
      {children}
    </Text>
  );
}

// TimelineHeader
function TimelineHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <Box className={cn(className)} data-slot="timeline-header" {...props} />;
}

// TimelineIndicator
interface TimelineIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const TimelineIndicator = forwardRef<HTMLDivElement, TimelineIndicatorProps>(
  ({ asChild = false, className, children, style, ...props }, ref) => {
    const Comp = asChild ? Slot : Box;

    return (
      <Comp
        aria-hidden="true"
        className={cn(
          'border-teal-500/30 group-data-[completed]/timeline-item:border-teal-500 absolute group-data-[orientation=vertical]/timeline:top-0',
          className
        )}
        data-slot="timeline-indicator"
        ref={ref}
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          borderWidth: '2px',
          borderStyle: 'solid',
          ...style,
        }}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
TimelineIndicator.displayName = 'TimelineIndicator';

// TimelineItem
interface TimelineItemProps extends HTMLAttributes<HTMLDivElement> {
  step: number;
  completed?: boolean;
  separatorActive?: boolean;
}

function TimelineItem({ step, completed, separatorActive, className, ...props }: TimelineItemProps) {
  const { activeStep } = useTimeline();
  const isCompleted = completed ?? step <= activeStep;
  const isNextCompleted = separatorActive ?? step < activeStep;

  return (
    <FlexLayout
      className={cn(
        'group/timeline-item relative flex-1 flex-col group-data-[orientation=vertical]/timeline:not-last:pb-6',
        className
      )}
      data-completed={isCompleted || undefined}
      data-separator-active={isNextCompleted || undefined}
      data-slot="timeline-item"
      style={{ gap: '2px' }}
      {...props}
    />
  );
}

// TimelineSeparator
function TimelineSeparator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Box
      aria-hidden="true"
      className={cn(
        'bg-teal-500/20 group-data-[separator-active]/timeline-item:bg-teal-500 absolute self-start group-last/timeline-item:hidden',
        className
      )}
      data-slot="timeline-separator"
      {...props}
    />
  );
}

// TimelineTitle
const TimelineTitle = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <Box className={cn(className)} data-slot="timeline-title" ref={ref} {...props}>
        {children}
      </Box>
    );
  }
);
TimelineTitle.displayName = 'TimelineTitle';

export {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
};
