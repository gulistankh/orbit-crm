// src/components/layout/Topbar.jsx
// Top bar: menu button (mobile), a center slot for search, and a right slot for actions.

import { colors, radius, spacing, layout } from "../../styles/theme";
import GlobalSearch from "./GlobalSearch";
import QuickAdd from "./QuickAdd";
import NotificationBell from "../notifications/NotificationBell";
import FilterBar from "../ui/FilterBar";
import { usePageFilters } from "../../hooks/usePageFilters";

const styles = {
  bar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    height: layout.topbarHeight,
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderBottom: `1px solid ${colors.border}`,
  },
  menuButton: {
    width: 38,
    height: 38,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.textSecondary,
  },
  center: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minWidth: 0,
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: spacing.sm,
    // the "+ New" button goes here
  },
};

export default function Topbar({ isMobile, onMenuClick }) {
  const { definitions, values, setFilter, clearFilters } = usePageFilters();

  return (
    <header
      style={{
        ...styles.bar,
        padding: `0 ${isMobile ? spacing.lg : spacing.xl}px`,
      }}
    >
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
      <div style={styles.center}>
        <GlobalSearch isMobile={isMobile} />
        <FilterBar
          filters={definitions}
          values={values}
          onChange={setFilter}
          onClear={clearFilters}
        />
      </div>
      <div style={styles.right}>
        <NotificationBell />
        <QuickAdd />
      </div>
    </header>
  );
}