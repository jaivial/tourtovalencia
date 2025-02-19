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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Creates a Date object from a YYYY-MM-DD string in local timezone
 */
export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date();
  // Set the time to noon first to avoid any timezone issues
  date.setHours(12, 0, 0, 0);
  date.setFullYear(year);
  date.setMonth(month - 1);
  date.setDate(day);
  // Then set to midnight
  date.setHours(0, 0, 0, 0);
  return date;
};
