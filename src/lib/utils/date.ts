import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);

export enum DateTimeFormat {
  IsoShort = 'YYYY-MM-DD',
  MilitaryTime = 'HHmm',
}

export function formatDateString(date: string, dateFormat = 'MMM D, YYYY') {
  return dayjs(date).format(dateFormat);
}

export function getDateInLocalTimezone(isoString: string) {
  return dayjs(isoString).toDate();
}

export function getDataPointDateString(dataPoint: string | undefined) {
  return dataPoint ? formatDateString(dataPoint, 'DD.MM.YYYY') : '—';
}
