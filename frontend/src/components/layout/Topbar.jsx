// src/components/layout/Topbar.jsx
// Top bar: menu button (mobile), greeting, and the logout button.

import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { colors, spacing, fontSizes, fontWeights, layout } from "../../styles/theme";

const styles = {
  bar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    height: layout.topbarHeight,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: `0 ${spacing.xl}px`,
    backgroundColor: colors.surface,
    borderBottom: `1px solid ${colors.border}`,
  },
  left: { display: "flex", alignItems: "center", gap: spacing.md },
  menuButton: {
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    borderRadius: 8,
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: colors.textSecondary,
  },
  greeting: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
  right: { display: "flex", alignItems: "center", gap: spacing.md },
};

export default function Topbar({ isMobile, onMenuClick }) {
  const { currentUser, logout } = useAuth();
  const { roleLabel } = usePermissions();

  const firstName = currentUser ? currentUser.name.split(" ")[0] : "";

  return (
    <header style={styles.bar}>
      <div style={styles.left}>
        {isMobile && (
          <button
            type="button"
            className="btn-ghost"
            aria-label="Open menu"
            style={styles.menuButton}
            onClick={onMenuClick}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
        {!isMobile && <span style={styles.greeting}>Welcome back, {firstName}</span>}
      </div>

      <div style={styles.right}>
        <Badge tone="primary">{roleLabel}</Badge>
        <Button variant="secondary" size="sm" onClick={logout}>
          Log out
        </Button>
      </div>
    </header>
  );
}