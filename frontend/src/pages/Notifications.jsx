// src/pages/Notifications.jsx
// All notifications, with an All / Unread switch and "Mark all as read".

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import NotificationItem from "../components/notifications/NotificationItem";
import { useData } from "../context/DataContext";
import {
  card,
  colors,
  pageTitle,
  radius,
  shadows,
  spacing,
  fontSizes,
  fontWeights,
} from "../styles/theme";

const styles = {
  header: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  subtitle: {
    margin: "6px 0 0",
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  tabs: {
    display: "inline-flex",
    gap: 4,
    padding: 4,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
  },
  tab: {
    padding: "7px 16px",
    border: "none",
    borderRadius: radius.sm,
    backgroundColor: "transparent",
    color: colors.textSecondary,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  },
  tabActive: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontWeight: fontWeights.semibold,
    boxShadow: shadows.sm,
  },
  card: { ...card, overflow: "hidden" },
};

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } =
    useData();
  const [tab, setTab] = useState("all");

  const visible =
    tab === "unread" ? notifications.filter((n) => !n.readAt) : notifications;

  function handleOpen(notification) {
    markNotificationRead(notification.id);
    if (notification.link) navigate(notification.link);
  }

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={pageTitle}>Notifications</h1>
          <p style={styles.subtitle}>
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "You're all caught up."}
          </p>
        </div>
        <Button
          variant="secondary"
          disabled={unreadCount === 0}
          onClick={markAllNotificationsRead}
        >
          Mark all as read
        </Button>
      </div>

      <div style={styles.tabs} role="tablist">
        {[
          { key: "all", label: "All" },
          { key: "unread", label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            style={{ ...styles.tab, ...(tab === item.key ? styles.tabActive : {}) }}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div style={styles.card}>
        {visible.length === 0 ? (
          <EmptyState
            title={tab === "unread" ? "Nothing unread" : "No notifications yet"}
            message={
              tab === "unread"
                ? "You've read everything. New notifications will show up here."
                : "You'll be notified when someone assigns you a record, moves your deal, logs activity on your contacts, or changes your role."
            }
          />
        ) : (
          visible.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onOpen={handleOpen}
            />
          ))
        )}
      </div>
    </div>
  );
}