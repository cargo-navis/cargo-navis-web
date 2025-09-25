import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import utc from 'dayjs/plugin/utc';

dayjs.extend(advancedFormat);
dayjs.extend(utc);

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

export function getDateTimeInLocalTimezone(isoString: string, format = 'DD.MM.YYYY, HH:mm') {
  return dayjs(isoString).local().format(format);
}
