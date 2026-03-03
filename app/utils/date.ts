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
  // Handle ISO strings by extracting just the date part
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  
  // Validate the date components
  if (isNaN(year) || isNaN(month) || isNaN(day) || 
      year < 2000 || year > 2100 || 
      month < 1 || month > 12 || 
      day < 1 || day > 31) {
    // Return current date if invalid
    return new Date();
  }
  
  // Create a new date object with the date components using local timezone
  // Important: We use this specific format to avoid timezone issues
  // This creates a date at the specified date in the local timezone
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00`;
  const date = new Date(dateStr);
  
  // Set to midnight in local timezone
  date.setHours(0, 0, 0, 0);
  
  return date;
};

/**
 * Converts a local date to UTC midnight
 * This is a critical function for database queries and updates
 */
export const localDateToUTCMidnight = (localDate: Date): Date => {
  // Extract the year, month, and day from the local date
  const year = localDate.getFullYear();
  const month = localDate.getMonth();
  const day = localDate.getDate();
  
  // Create a UTC date string for the same calendar day
  // Using the YYYY-MM-DDT00:00:00Z format ensures it's interpreted as UTC
  const utcDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00Z`;
  return new Date(utcDateStr);
};

/**
 * Converts a UTC date to local midnight
 * This is a critical function for displaying dates to users
 */
export const utcDateToLocalMidnight = (utcDate: Date): Date => {
  // Extract the UTC year, month, and day
  const utcYear = utcDate.getUTCFullYear();
  const utcMonth = utcDate.getUTCMonth();
  const utcDay = utcDate.getUTCDate();
  
  // Create a local date string for the same calendar day
  // Using this format ensures it's interpreted in the local timezone
  const localDateStr = `${utcYear}-${String(utcMonth + 1).padStart(2, '0')}-${String(utcDay).padStart(2, '0')}T12:00:00`;
  const localDate = new Date(localDateStr);
  
  // Set to midnight in local timezone
  localDate.setHours(0, 0, 0, 0);

  return localDate;
};
