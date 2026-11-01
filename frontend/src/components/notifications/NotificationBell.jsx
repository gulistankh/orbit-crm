// src/components/notifications/NotificationBell.jsx
// The bell in the top bar: unread count, a dropdown with the latest notifications,
// "Mark all read", and a link to the full page.

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import NotificationItem from "./NotificationItem";
import { useData } from "../../context/DataContext";
import {
  colors,
  radius,
  shadows,
  spacing,
  fontSizes,
  fontWeights,
} from "../../styles/theme";

const styles = {
  anchor: { position: "relative" },
  bell: {
    position: "relative",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.textSecondary,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    padding: "0 5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
    color: "#FFFFFF",
    border: `2px solid ${colors.surface}`,
    fontSize: 11,
    fontWeight: fontWeights.bold,
    lineHeight: 1,
  },
  panel: {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    width: "min(380px, calc(100vw - 32px))",
    overflow: "hidden",
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.lg,
    boxShadow: shadows.lg,
    zIndex: 150,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderBottom: `1px solid ${colors.border}`,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  list: { maxHeight: 420, overflowY: "auto" },
  empty: {
    padding: `${spacing.xxl}px ${spacing.lg}px`,
    textAlign: "center",
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
  footer: { padding: spacing.sm },
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } =
    useData();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close with Escape or by clicking elsewhere
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  function handleOpenNotification(notification) {
    markNotificationRead(notification.id);
    setOpen(false);
    if (notification.link) navigate(notification.link);
  }

  function handleViewAll() {
    setOpen(false);
    navigate("/notifications");
  }

  const latest = notifications.slice(0, 6);

  return (
    <div ref={wrapperRef} style={styles.anchor}>
      <button
        type="button"
        className="btn-secondary"
        style={styles.bell}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div role="dialog" aria-label="Notifications" style={styles.panel}>
          <div style={styles.header}>
            <span style={styles.title}>Notifications</span>
            <Button
              variant="ghost"
              size="sm"
              disabled={unreadCount === 0}
              onClick={markAllNotificationsRead}
            >
              Mark all read
            </Button>
          </div>

          <div style={styles.list}>
            {latest.length === 0 ? (
              <div style={styles.empty}>You're all caught up.</div>
            ) : (
              latest.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onOpen={handleOpenNotification}
                  compact
                />
              ))
            )}
          </div>

          <div style={styles.footer}>
            <Button variant="ghost" fullWidth onClick={handleViewAll}>
              View all notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}