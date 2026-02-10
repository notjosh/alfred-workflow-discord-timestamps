import * as chrono from "chrono-node";

const REVERSE_MATCH = /^<t:(\d+)(?::([a-zA-Z]))?>$|^(\d{10,})$/;

export function clockIcon(date) {
  const h = date.getHours() % 12;
  const m = Math.floor(date.getMinutes() / 5) * 5;
  return `icons/clock-${String(h).padStart(2, "0")}-${String(m).padStart(2, "0")}.png`;
}

export function formatRelative(date, now) {
  const diffMs = date.getTime() - now.getTime();
  const absDiffMs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absDiffMs < 60_000)
    return rtf.format(Math.round(diffMs / 1000), "second");
  if (absDiffMs < 3_600_000)
    return rtf.format(Math.round(diffMs / 60_000), "minute");
  if (absDiffMs < 86_400_000)
    return rtf.format(Math.round(diffMs / 3_600_000), "hour");
  if (absDiffMs < 2_592_000_000)
    return rtf.format(Math.round(diffMs / 86_400_000), "day");
  if (absDiffMs < 31_536_000_000)
    return rtf.format(Math.round(diffMs / 2_592_000_000), "month");
  return rtf.format(Math.round(diffMs / 31_536_000_000), "year");
}

export function parseQuery(query, now) {
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
      new Intl.DateTimeFormat("en-US", options).format(date);

    const formats = [
      { label: "Time", formatted: fmt({ timeStyle: "short" }) },
      { label: "Time w/ Seconds", formatted: fmt({ timeStyle: "medium" }) },
      { label: "Relative", formatted: formatRelative(date, now) },
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
  const date = chrono.casual.parseDate(query, now, { forwardDate: true });

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
    new Intl.DateTimeFormat("en-US", options).format(date);

  const formats = [
    { code: "t", label: "Time", subtitle: fmt({ timeStyle: "short" }) },
    {
      code: "T",
      label: "Time w/ Seconds",
      subtitle: fmt({ timeStyle: "medium" }),
    },
    { code: "R", label: "Relative", subtitle: formatRelative(date, now) },
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
