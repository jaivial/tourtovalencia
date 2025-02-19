/**
 * Creates a Date object at midnight in the local timezone
 */
export const getLocalMidnight = (date: Date): Date => {
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);
  return localDate;
};

/**
 * Creates a Date object at 23:59:59.999 in the local timezone
 */
export const getLocalEndOfDay = (date: Date): Date => {
  const localDate = new Date(date);
  localDate.setHours(23, 59, 59, 999);
  return localDate;
};

/**
 * Formats a date as YYYY-MM-DD in local timezone
 */
export const formatLocalDate = (date: Date): string => {
  const localDate = new Date(date);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Creates a Date object from a YYYY-MM-DD string in local timezone
 */
export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date();
  // Set the date components in local timezone
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Converts a local date to UTC midnight
 */
export const localDateToUTCMidnight = (localDate: Date): Date => {
  const utcDate = new Date(Date.UTC(
    localDate.getFullYear(),
    localDate.getMonth(),
    localDate.getDate(),
    0, 0, 0, 0
  ));
  return utcDate;
};

/**
 * Converts a UTC date to local midnight
 */
export const utcDateToLocalMidnight = (utcDate: Date): Date => {
  const localDate = new Date(utcDate);
  localDate.setHours(0, 0, 0, 0);
  return localDate;
};
