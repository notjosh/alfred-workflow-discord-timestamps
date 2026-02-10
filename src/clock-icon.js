/**
 * Returns the path to a clock-face icon matching the given time.
 * Icons are in 5-minute increments on a 12-hour clock.
 *
 * @param {Date} date
 * @returns {string} path like `icons/clock-03-15.png`
 */
export function clockIcon(date) {
  const h = date.getHours() % 12;
  const m = Math.floor(date.getMinutes() / 5) * 5;
  return `icons/clock-${String(h).padStart(2, "0")}-${String(m).padStart(2, "0")}.png`;
}
