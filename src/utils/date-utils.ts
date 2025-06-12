export enum DateAction {
  Back,
  Reset,
  Forward,
}

/**
 * Formats a Date to 'YYYY-MM-DD'
 */
export function toSimpleDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Returns a new date string based on the given action
 */
export function handleDateActionForDate(action: DateAction, dateAsString: string): string {
  let date: Date;

  switch (action) {
    case DateAction.Reset:
      date = new Date();
      break;

    case DateAction.Back:
      date = new Date(dateAsString);
      if (isNaN(date.getTime())) throw new Error("Invalid date string");
      date.setDate(date.getDate() - 1);
      break;

    case DateAction.Forward:
      date = new Date(dateAsString);
      if (isNaN(date.getTime())) throw new Error("Invalid date string");
      date.setDate(date.getDate() + 1);
      break;

    default:
      throw new Error("Unhandled date action");
  }

  return toSimpleDateString(date);
}
