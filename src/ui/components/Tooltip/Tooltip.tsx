import {
  arrow as arrowMiddleware,
  autoUpdate,
  flip,
  FloatingPortal,
  offset as offsetPlugin,
  safePolygon,
  shift,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { cloneElement, useMemo, useRef, useState } from 'react';

import { Box } from '../Box';
import { DisplayIf } from '../DisplayIf';

const MotionBox = motion(Box);
const motionTransition = { type: 'spring', damping: 20, stiffness: 300 };

const TOOLTIP_BG = 'bg-dark-800 dark:bg-light-800';

export interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactElement;
  offset?: number;
  isPortal?: boolean;
  interactive?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  offset = 10,
  isPortal = false,
  interactive = false,
}) => {
  const arrowRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const {
    x,
    y,
    placement,
    refs,
    strategy,
    context,
    middlewareData: { arrow },
  } = useFloating({
    placement: 'top',
    whileElementsMounted: autoUpdate,
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offsetPlugin(offset), flip(), shift({ padding: 2 }), arrowMiddleware({ element: arrowRef })],
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, interactive ? { handleClose: safePolygon() } : {}),
    useFocus(context, {}),
    useRole(context, { role: 'tooltip' }),
  ]);

  const staticSide = useMemo(
    () =>
      ({
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      })[placement.split('—')[0]],
    [placement]
  ) as string;

  const motionContent = (
    <MotionBox
      animate={{ opacity: 1 }}
      className={clsx('p-1 z-[600] rounded-[10px] text-xxs font-semibold', TOOLTIP_BG)}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      ref={refs.setFloating}
      style={{ position: strategy, top: y ?? 0, left: x ?? 0 }}
      transition={motionTransition}
      {...getFloatingProps()}
    >
      {content}
      <Box
        className={clsx('absolute w-[12px] h-[12px] rounded-[2px] rotate-45', TOOLTIP_BG)}
        ref={arrowRef}
        style={{
          left: arrow?.x ? `${arrow?.x}px` : '',
          top: arrow?.y ? `${arrow?.y}px` : '',
          right: '',
          bottom: '',
          [staticSide]: '-5px',
        }}
      />
    </MotionBox>
  );

  return (
    <>
      {cloneElement(children, getReferenceProps({ ref: refs.setReference }))}
      <AnimatePresence>
        {isOpen && (
          <DisplayIf condition={isPortal} fallback={motionContent}>
            <FloatingPortal>{motionContent}</FloatingPortal>
          </DisplayIf>
        )}
      </AnimatePresence>
    </>
  );
};
