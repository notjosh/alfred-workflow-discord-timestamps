/** @typedef {"second"|"minute"|"hour"|"day"|"month"|"year"} RelativeUnit */

/**
 * Thresholds for picking the best relative-time unit.
 * Each entry is [ceiling in ms, divisor in ms, Intl unit].
 *
 * @type {Array<[number, number, RelativeUnit]>}
 */
const UNITS = [
  [60_000, 1_000, "second"],
  [3_600_000, 60_000, "minute"],
  [86_400_000, 3_600_000, "hour"],
  [2_592_000_000, 86_400_000, "day"],
  [31_536_000_000, 2_592_000_000, "month"],
];

/**
 * Formats the distance between two dates as a locale-aware relative
 * string (e.g. "in 3 hours", "2 days ago") using `Intl.RelativeTimeFormat`.
 *
 * @param {Date} date - the target date
 * @param {Date} now - the reference date
 * @param {string} [locale] - BCP 47 locale tag; omit for system default
 * @returns {string}
 */
export function formatRelative(date, now, locale) {
  const diffMs = date.getTime() - now.getTime();
  const absDiffMs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  for (const [ceiling, divisor, unit] of UNITS) {
    if (absDiffMs < ceiling) {
      return rtf.format(Math.round(diffMs / divisor), unit);
    }
  }

  return rtf.format(Math.round(diffMs / 31_536_000_000), "year");
}
