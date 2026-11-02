// src/components/notifications/NotificationBell.jsx
// The bell in the top bar: unread count, a dropdown with the latest notifications,
// "Mark all read", and a link to the full page.
// The dropdown is drawn on document.body and placed from the bell's position, so it is
// never clipped by the top bar. On phones it spans the screen width.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const PANEL_WIDTH = 380;
const SCREEN_MARGIN = 16;
const PHONE_WIDTH = 640;

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
    position: "fixed",
    zIndex: 950,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.lg,
    boxShadow: shadows.lg,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderBottom: `1px solid ${colors.border}`,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  list: { flex: "1 1 auto", minHeight: 0, overflowY: "auto" },
  empty: {
    padding: `${spacing.xxl}px ${spacing.lg}px`,
    textAlign: "center",
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
  footer: { flexShrink: 0, padding: spacing.sm },
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } =
    useData();
  const [open, setOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  // Work out where the panel goes from the bell's position on screen
  function openPanel() {
    const rect = buttonRef.current.getBoundingClientRect();
    const top = rect.bottom + 10;
    const maxHeight = Math.max(240, window.innerHeight - top - SCREEN_MARGIN);

    if (window.innerWidth <= PHONE_WIDTH) {
      // phone: full width, with a margin on each side
      setPanelPosition({ top, left: SCREEN_MARGIN, right: SCREEN_MARGIN, maxHeight });
    } else {
      // computer: under the bell, lined up with its right edge
      setPanelPosition({
        top,
        right: Math.max(SCREEN_MARGIN, window.innerWidth - rect.right),
        width: PANEL_WIDTH,
        maxHeight,
      });
    }
    setOpen(true);
  }

  // Close with Escape, by clicking elsewhere, or when the screen changes size
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    function handleClickOutside(event) {
      const inButton = buttonRef.current && buttonRef.current.contains(event.target);
      const inPanel = panelRef.current && panelRef.current.contains(event.target);
      if (!inButton && !inPanel) setOpen(false);
    }
    function handleResize() {
      setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
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
    <div style={styles.anchor}>
      <button
        ref={buttonRef}
        type="button"
        className="btn-secondary"
        style={styles.bell}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openPanel())}
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

      {open &&
        panelPosition &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Notifications"
            style={{ ...styles.panel, ...panelPosition }}
          >
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

            <div className="thin-scroll" style={styles.list}>
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
          </div>,
          document.body
        )}
    </div>
  );
}