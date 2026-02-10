import { casual } from "chrono-node";
import { clockIcon } from "./clock-icon.js";
import { formatRelative } from "./format-relative.js";

const REVERSE_MATCH = /^<t:(\d+)(?::([a-zA-Z]))?>$|^(\d{10,})$/;

/**
 * Parses a user query and returns Alfred Script Filter items.
 *
 * Supports two modes:
 * - **Reverse**: a Discord timestamp or bare unix timestamp → formatted dates
 * - **Forward**: natural language → Discord `<t:…>` timestamps
 *
 * @param {string} query - the raw user input from Alfred
 * @param {Date} now - the current time (injected for testability)
 * @param {object} [options]
 * @param {string} [options.locale] - BCP 47 locale tag; omit for system default
 * @returns {Array<{title: string, subtitle: string, arg?: string, valid?: boolean, icon?: {path: string}}>}
 */
export function parseQuery(query, now, { locale } = {}) {
  if (!query.trim()) {
    return [
      {
        title: "Type a date or time…",
        subtitle: 'e.g. "tomorrow at 3pm", "next friday", "in 2 hours"',
        valid: false,
      },
    ];
  }

  // Reverse mode: Discord timestamp or bare unix timestamp → formatted dates
  const reverseMatch = query.match(REVERSE_MATCH);
  if (reverseMatch) {
    const ts = Number(reverseMatch[1] ?? reverseMatch[3]);
    const date = new Date(ts * 1000);

    const fmt = (options) =>
      new Intl.DateTimeFormat(locale, options).format(date);

    const formats = [
      { label: "Time", formatted: fmt({ timeStyle: "short" }) },
      { label: "Time w/ Seconds", formatted: fmt({ timeStyle: "medium" }) },
      { label: "Relative", formatted: formatRelative(date, now, locale) },
      { label: "Short Date", formatted: fmt({ dateStyle: "short" }) },
      { label: "Date", formatted: fmt({ dateStyle: "long" }) },
      {
        label: "Date/Time",
        formatted: fmt({ dateStyle: "long", timeStyle: "short" }),
      },
      {
        label: "Full Date/Time",
        formatted: fmt({ dateStyle: "full", timeStyle: "short" }),
      },
    ];

    const icon = { path: clockIcon(date) };
    return formats.map(({ label, formatted }) => ({
      title: formatted,
      subtitle: label,
      arg: formatted,
      icon,
    }));
  }

  // Forward mode: natural language → Discord timestamps
  const date = casual.parseDate(query, now, { forwardDate: true });

  if (!date) {
    return [
      {
        title: "Couldn't parse date",
        subtitle: `No date found in "${query}"`,
        valid: false,
      },
    ];
  }

  const ts = Math.floor(date.getTime() / 1000);

  const fmt = (options) =>
    new Intl.DateTimeFormat(locale, options).format(date);

  const formats = [
    { code: "t", label: "Time", subtitle: fmt({ timeStyle: "short" }) },
    {
      code: "T",
      label: "Time w/ Seconds",
      subtitle: fmt({ timeStyle: "medium" }),
    },
    {
      code: "R",
      label: "Relative",
      subtitle: formatRelative(date, now, locale),
    },
    { code: "d", label: "Short Date", subtitle: fmt({ dateStyle: "short" }) },
    { code: "D", label: "Date", subtitle: fmt({ dateStyle: "long" }) },
    {
      code: "f",
      label: "Date/Time",
      subtitle: fmt({ dateStyle: "long", timeStyle: "short" }),
    },
    {
      code: "F",
      label: "Full Date/Time",
      subtitle: fmt({ dateStyle: "full", timeStyle: "short" }),
    },
  ];

  const icon = { path: clockIcon(date) };
  return formats.map(({ code, label, subtitle }) => ({
    title: `<t:${ts}:${code}>`,
    subtitle: `${label} — ${subtitle}`,
    arg: `<t:${ts}:${code}>`,
    icon,
  }));
}
