import type * as React from 'react';

/**
 * The app frame (DECISIONS §4): petrol 6 % in light (border 14 %), teal-900 in dark. Behind the dashboard sidebar and
 * around its content card. Put `FRAME_STYLE` and `FRAME_CLASS` on the
 * same element (`!`: SidebarProvider sets has-data-[variant=inset]:bg-sidebar, which outranks a plain bg-*).
 */
export const FRAME_STYLE = {
  '--frame-light': 'color-mix(in oklch, #0B5560 6%, white)',
  '--frame-border': 'color-mix(in oklch, #0B5560 14%, white)',
} as React.CSSProperties;

export const FRAME_CLASS = 'bg-(--frame-light)! dark:bg-teal-900!';
