
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      // Handle invalid date strings gracefully
      console.warn(`Invalid date provided to formatDate: ${date}`);
      return "Invalid Date";
    }
    return format(dateObj, 'MMM d, yyyy');
  } catch (error) {
    console.error(`Error formatting date: ${date}`, error);
    return "Error Date";
  }
}
