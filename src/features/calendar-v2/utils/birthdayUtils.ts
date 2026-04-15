import dayjs from 'dayjs';

/**
 * Checks whether today is the birthday of a student based on their date of birth.
 * Only the month and day are compared (not the year).
 *
 * @param dateOfBirth - Date string in YYYY-MM-DD format
 */
export const isBirthday = (dateOfBirth?: string): boolean => {
  if (!dateOfBirth) return false;
  const today = dayjs();
  const dob = dayjs(dateOfBirth);
  return dob.month() === today.month() && dob.date() === today.date();
};
