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
 * This is a critical function for parsing date strings from URL parameters
 */
export const parseLocalDate = (dateString: string): Date => {
  console.log("parseLocalDate: Input date string:", dateString);
  
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Validate the date components
  if (isNaN(year) || isNaN(month) || isNaN(day) || 
      year < 2000 || year > 2100 || 
      month < 1 || month > 12 || 
      day < 1 || day > 31) {
    console.error("parseLocalDate: Invalid date components:", { year, month, day });
    // Return current date if invalid
    return new Date();
  }
  
  // Create a new date object with the date components
  // Note: month is 0-indexed in JavaScript Date
  const date = new Date();
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  
  console.log("parseLocalDate: Output local date:", {
    iso: date.toISOString(),
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate()
  });
  
  return date;
};

/**
 * Converts a local date to UTC midnight
 * This is a critical function for database queries and updates
 */
export const localDateToUTCMidnight = (localDate: Date): Date => {
  console.log("localDateToUTCMidnight: Input local date:", {
    iso: localDate.toISOString(),
    year: localDate.getFullYear(),
    month: localDate.getMonth(),
    day: localDate.getDate()
  });
  
  // Create a UTC date at midnight for the same calendar day
  // This ensures that regardless of the local timezone, we get the UTC date
  // that corresponds to the same calendar day in the local timezone
  const utcDate = new Date(Date.UTC(
    localDate.getFullYear(),
    localDate.getMonth(),
    localDate.getDate(),
    0, 0, 0, 0
  ));
  
  console.log("localDateToUTCMidnight: Output UTC date:", {
    iso: utcDate.toISOString(),
    utcYear: utcDate.getUTCFullYear(),
    utcMonth: utcDate.getUTCMonth(),
    utcDay: utcDate.getUTCDate()
  });
  
  return utcDate;
};

/**
 * Converts a UTC date to local midnight
 * This is a critical function for displaying dates to users
 */
export const utcDateToLocalMidnight = (utcDate: Date): Date => {
  console.log("utcDateToLocalMidnight: Input UTC date:", {
    iso: utcDate.toISOString(),
    utcYear: utcDate.getUTCFullYear(),
    utcMonth: utcDate.getUTCMonth(),
    utcDay: utcDate.getUTCDate()
  });
  
  // Create a new date object from the UTC date
  // This will convert it to the local timezone
  const localDate = new Date(utcDate);
  
  // Set the time to midnight in the local timezone
  localDate.setHours(0, 0, 0, 0);
  
  console.log("utcDateToLocalMidnight: Output local date:", {
    iso: localDate.toISOString(),
    year: localDate.getFullYear(),
    month: localDate.getMonth(),
    day: localDate.getDate()
  });
  
  return localDate;
};
