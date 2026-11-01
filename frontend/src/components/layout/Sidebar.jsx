// src/components/layout/Sidebar.jsx
// Left navigation (dark). On desktop it's always visible.
// On small screens it slides in from the left (AppLayout controls open/close).

import { NavLink } from "react-router-dom";
import Avatar from "../ui/Avatar";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import {
  colors,
  spacing,
  radius,
  fontSizes,
  fontWeights,
  layout,
} from "../../styles/theme";

const icons = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </>
  ),
  contacts: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  companies: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </>
  ),
  deals: (
    <>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </>
  ),
  users: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
};

function NavIcon({ name }) {
  return (
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
      {icons[name]}
    </svg>
  );
}

const navItems = [
  { to: "/", label: "Dashboard", icon: "dashboard", end: true },
  { to: "/contacts", label: "Contacts", icon: "contacts" },
  { to: "/companies", label: "Companies", icon: "companies" },
  { to: "/deals", label: "Deals", icon: "deals" },
  { to: "/users", label: "Users & roles", icon: "users", permission: "users:view" },
];

const styles = {
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: layout.sidebarWidth,
    backgroundColor: colors.sidebarBg,
    borderRight: `1px solid ${colors.sidebarBorder}`,
    display: "flex",
    flexDirection: "column",
    zIndex: 900,
    transition: "transform 0.2s ease",
  },
  brand: {
    height: layout.topbarHeight,
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
    padding: `0 ${spacing.xl}px`,
    borderBottom: `1px solid ${colors.sidebarBorder}`,
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    background: "linear-gradient(135deg, #14B8A6, #0F766E)",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.md,
  },
  brandName: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.sidebarTextActive,
    letterSpacing: "-0.01em",
  },
  sectionLabel: {
    padding: `${spacing.xl}px ${spacing.xl}px ${spacing.sm}px`,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#6F8A86",
  },
  nav: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: `0 ${spacing.md}px ${spacing.md}px`,
    overflowY: "auto",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
    padding: "10px 12px",
    borderRadius: radius.md,
    textDecoration: "none",
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.sidebarText,
  },
  linkActive: {
    backgroundColor: colors.sidebarActiveBg,
    color: colors.sidebarTextActive,
    boxShadow: `inset 3px 0 0 ${colors.sidebarAccent}`,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderTop: `1px solid ${colors.sidebarBorder}`,
  },
  userText: { flex: 1, minWidth: 0 },
  userName: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.sidebarTextActive,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userRole: { fontSize: fontSizes.xs, color: colors.sidebarText },
  logoutButton: {
    width: 34,
    height: 34,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: radius.sm,
    backgroundColor: "transparent",
    color: colors.sidebarText,
  },
};

export default function Sidebar({ isMobile, open, onClose }) {
  const { currentUser, logout } = useAuth();
  const { can, roleLabel } = usePermissions();

  const hidden = isMobile && !open;

  return (
    <aside
      style={{
        ...styles.sidebar,
        transform: hidden ? "translateX(-100%)" : "translateX(0)",
      }}
    >
      <div style={styles.brand}>
        <div style={styles.brandMark}>O</div>
        <span style={styles.brandName}>Orbit CRM</span>
      </div>

      <div style={styles.sectionLabel}>Workspace</div>
      <nav style={styles.nav}>
        {navItems
          .filter((item) => !item.permission || can(item.permission))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) => (isActive ? "" : "nav-link")}
              style={({ isActive }) => ({
                ...styles.link,
                ...(isActive ? styles.linkActive : {}),
              })}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
      </nav>

      {currentUser && (
        <div style={styles.footer}>
          <Avatar name={currentUser.name} size={36} />
          <div style={styles.userText}>
            <div style={styles.userName}>{currentUser.name}</div>
            <div style={styles.userRole}>{roleLabel}</div>
          </div>
          <button
            type="button"
            className="sidebar-icon-btn"
            style={styles.logoutButton}
            onClick={logout}
            aria-label="Log out"
            title="Log out"
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      )}
    </aside>
  );
}