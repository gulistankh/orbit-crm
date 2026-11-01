// src/components/ui/TimeStamp.jsx
// A small clock icon plus a muted, regular-weight date or time.
//   <TimeStamp value={contact.createdAt} />                    -> Oct 27, 2026
//   <TimeStamp value={activity.createdAt} mode="datetime" />   -> Oct 27, 2026, 8:20 PM
//   <TimeStamp value={activity.createdAt} mode="relative" />   -> 2 days ago
// Hover shows the full date and time.

import { formatDate, formatDateTime, timeAgo, parseDate } from "../../utils/formatters";
import { colors, fontSizes, fontWeights } from "../../styles/theme";

const formatters = {
  date: formatDate,
  datetime: formatDateTime,
  relative: timeAgo,
};

export default function TimeStamp({ value, mode = "date", style }) {
  if (!value) return <span style={{ color: colors.textMuted }}>-</span>;

  const date = parseDate(value);
  const valid = !Number.isNaN(date.getTime());
  const text = valid ? (formatters[mode] || formatDate)(value) : String(value);

  return (
    <span
      title={valid ? formatDateTime(value) : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: fontSizes.sm,
        fontWeight: fontWeights.regular,
        color: colors.textMuted,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 14" />
      </svg>
      {valid ? <time dateTime={date.toISOString()}>{text}</time> : text}
    </span>
  );
}
