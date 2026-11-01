// src/components/notifications/NotificationItem.jsx
// One notification row. Unread ones have a teal dot and slightly bolder text.

import TimeStamp from "../ui/TimeStamp";
import { colors, spacing, fontSizes, fontWeights } from "../../styles/theme";

const typeStyles = {
  assigned: {
    bg: colors.primarySoft,
    color: colors.primary,
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8" x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
      </>
    ),
  },
  deal_moved: {
    bg: colors.infoSoft,
    color: colors.info,
    icon: (
      <>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </>
    ),
  },
  activity_logged: {
    bg: colors.warningSoft,
    color: colors.warning,
    icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  },
  role_changed: {
    bg: "#EDE7FB",
    color: "#6D28D9",
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
};

const styles = {
  item: {
    display: "flex",
    alignItems: "flex-start",
    gap: spacing.md,
    width: "100%",
    padding: "12px 16px",
    border: "none",
    borderBottom: `1px solid ${colors.border}`,
    textAlign: "left",
  },
  icon: {
    width: 34,
    height: 34,
    minWidth: 34,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, minWidth: 0 },
  message: {
    color: colors.textPrimary,
    lineHeight: 1.45,
    overflowWrap: "anywhere",
  },
  time: { marginTop: 4, fontSize: fontSizes.xs },
  dot: {
    width: 8,
    height: 8,
    marginTop: 7,
    flexShrink: 0,
    borderRadius: "50%",
  },
};

export default function NotificationItem({ notification, onOpen, compact = false }) {
  const unread = !notification.readAt;
  const look = typeStyles[notification.type] || typeStyles.assigned;

  return (
    <button
      type="button"
      className="row-hover"
      onClick={() => onOpen(notification)}
      style={{
        ...styles.item,
        backgroundColor: unread ? "rgba(15, 118, 110, 0.06)" : "transparent",
      }}
    >
      <span style={{ ...styles.icon, backgroundColor: look.bg, color: look.color }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {look.icon}
        </svg>
      </span>

      <span style={styles.body}>
        <div
          style={{
            ...styles.message,
            fontSize: compact ? fontSizes.sm : fontSizes.md,
            fontWeight: unread ? fontWeights.medium : fontWeights.regular,
          }}
        >
          {notification.message}
        </div>
        <div style={styles.time}>
          <TimeStamp
            value={notification.createdAt}
            mode={compact ? "relative" : "datetime"}
            style={{ fontSize: fontSizes.xs }}
          />
        </div>
      </span>

      <span
        style={{
          ...styles.dot,
          backgroundColor: unread ? colors.primary : "transparent",
        }}
        aria-label={unread ? "Unread" : undefined}
      />
    </button>
  );
}