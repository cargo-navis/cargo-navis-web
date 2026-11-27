/**
 * Driver colour (DECISIONS §1): FNV-1a hash of the employee id → one of 5 tones (`--driver-1…5` in globals.css: sky,
 * indigo, pink, lime, stone). Same colour for the same driver on every page, device and session, nothing stored;
 * collisions are fine (initials and the name carry identity). Lab /transports (+ /tokens).
 */

export type DriverTone = 1 | 2 | 3 | 4 | 5;

/** 32-bit FNV-1a over the UTF-16 code units. */
export function fnv1a(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function driverTone(driverId: string): DriverTone {
  return ((fnv1a(driverId) % 5) + 1) as DriverTone;
}

export interface DriverToneClasses {
  /** Avatar: soft background + ink text. */
  avatar: string;
  /** Bars, runs, stripes. */
  bar: string;
  /** Text / icon in the driver's colour. */
  text: string;
}

// Literal class names (Tailwind only sees whole strings).
export const DRIVER_TONE_CLASSES: Record<DriverTone, DriverToneClasses> = {
  1: { avatar: 'bg-driver-1-soft text-driver-1-ink', bar: 'bg-driver-1', text: 'text-driver-1' },
  2: { avatar: 'bg-driver-2-soft text-driver-2-ink', bar: 'bg-driver-2', text: 'text-driver-2' },
  3: { avatar: 'bg-driver-3-soft text-driver-3-ink', bar: 'bg-driver-3', text: 'text-driver-3' },
  4: { avatar: 'bg-driver-4-soft text-driver-4-ink', bar: 'bg-driver-4', text: 'text-driver-4' },
  5: { avatar: 'bg-driver-5-soft text-driver-5-ink', bar: 'bg-driver-5', text: 'text-driver-5' },
};

/** No driver yet: red dashed avatar, faint red bar. */
export const MISSING_DRIVER_CLASSES: DriverToneClasses = {
  avatar: 'border border-dashed border-destructive text-destructive',
  bar: 'bg-destructive/40',
  text: 'text-destructive',
};

/** Classes for a driver id, or the „no driver” look. */
export function driverToneClasses(driverId: string | null | undefined): DriverToneClasses {
  return driverId ? DRIVER_TONE_CLASSES[driverTone(driverId)] : MISSING_DRIVER_CLASSES;
}
