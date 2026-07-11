import type { VehicleStop } from '@/lib/api/vehicleStops';

// A stop is completed as soon as the backend stamps `completedAt`.
export const isStopCompleted = (stop: VehicleStop) => Boolean(stop.completedAt);

/**
 * Completion may only move the route frontier by a single stop:
 *  - a stop can be completed only if it is the first not-yet-completed stop,
 *    i.e. its chronologically-earlier neighbour is already completed (or it is
 *    the first stop in the route);
 *  - a stop can be uncompleted only if it is the last completed stop, i.e. its
 *    chronologically-later neighbour is not completed (or it is the last stop).
 *
 * `previousStop`/`nextStop` are the route-chronological neighbours (earlier /
 * later). Note the stop lists are rendered latest-first, so a caller mapping
 * such an array picks the earlier neighbour at index i+1 and the later at i-1.
 */
export const getStopCompletionEligibility = (stop: VehicleStop, previousStop?: VehicleStop, nextStop?: VehicleStop) => {
  const completed = isStopCompleted(stop);

  return {
    canComplete: !completed && (!previousStop || isStopCompleted(previousStop)),
    canUncomplete: completed && (!nextStop || !isStopCompleted(nextStop)),
  };
};
