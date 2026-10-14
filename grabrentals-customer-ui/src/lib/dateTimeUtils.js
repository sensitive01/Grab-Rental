/**
 * Utilities for robust, timezone-aware local date and time formatting
 * and booking time validation.
 */

export function padZero(num) {
  return String(num).padStart(2, "0");
}

export function formatLocalDate(date = new Date()) {
  const y = date.getFullYear();
  const m = padZero(date.getMonth() + 1);
  const d = padZero(date.getDate());
  return `${y}-${m}-${d}`;
}

export function formatLocalTime(date = new Date()) {
  const h = padZero(date.getHours());
  const min = padZero(date.getMinutes());
  return `${h}:${min}`;
}

export function formatLocalDateTime(date = new Date()) {
  return `${formatLocalDate(date)}T${formatLocalTime(date)}`;
}

/**
 * Returns the earliest acceptable pickup time (now + minimum 45 minutes buffer).
 */
export function getMinPickupDate() {
  return new Date(Date.now() + 45 * 60 * 1000);
}

export function getMinPickupDateTimeString() {
  return formatLocalDateTime(getMinPickupDate());
}

/**
 * Generates an intelligent, realistic default pickup date and time:
 * - If current time is daytime (before 8:00 PM), defaults to now + 2 hours rounded to next 15-min slot.
 * - If current time is late evening/night (8:00 PM onwards), defaults to tomorrow morning at 08:00 AM.
 */
export function getDefaultPickupDateTime() {
  const now = new Date();
  const currentHour = now.getHours();

  if (currentHour >= 20) {
    // Late night -> Default to tomorrow 08:00 AM
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    return {
      date: formatLocalDate(tomorrow),
      time: "08:00",
      datetime: `${formatLocalDate(tomorrow)}T08:00`,
    };
  }

  // Daytime -> Default to 2 hours from now rounded up to next 15 mins
  const buffered = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const remainder = buffered.getMinutes() % 15;
  if (remainder !== 0) {
    buffered.setMinutes(buffered.getMinutes() + (15 - remainder));
  }
  buffered.setSeconds(0, 0);

  return {
    date: formatLocalDate(buffered),
    time: formatLocalTime(buffered),
    datetime: formatLocalDateTime(buffered),
  };
}

/**
 * Validates whether a selected date and time is in the past.
 */
export function isDateTimeInPast(dateStr, timeStr) {
  if (!dateStr || !timeStr) return true;
  const target = new Date(`${dateStr}T${timeStr}`);
  if (isNaN(target.getTime())) return true;
  return target.getTime() < getMinPickupDate().getTime();
}

/**
 * Ensures given date and time are not in the past, falling back to valid default.
 */
export function sanitizePickupDateTime(dateStr, timeStr) {
  if (isDateTimeInPast(dateStr, timeStr)) {
    return getDefaultPickupDateTime();
  }
  return {
    date: dateStr,
    time: timeStr,
    datetime: `${dateStr}T${timeStr}`,
  };
}
