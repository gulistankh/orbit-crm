// src/components/layout/Sidebar.jsx
// Left navigation. On desktop it's always visible.
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
    backgroundColor: colors.surface,
    borderRight: `1px solid ${colors.border}`,
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
    borderBottom: `1px solid ${colors.border}`,
  },
  brandMark: {
    width: 30,
    height: 30,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    color: colors.textOnPrimary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.md,
  },
  brandName: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  nav: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: spacing.md,
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
    color: colors.textSecondary,
  },
  linkActive: {
    backgroundColor: colors.primarySoft,
    color: colors.primary,
  },
  user: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderTop: `1px solid ${colors.border}`,
  },
  userText: { minWidth: 0 },
  userName: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userRole: { fontSize: fontSizes.xs, color: colors.textMuted },
};

export default function Sidebar({ isMobile, open, onClose }) {
  const { currentUser } = useAuth();
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
        <div style={styles.user}>
          <Avatar name={currentUser.name} size={36} />
          <div style={styles.userText}>
            <div style={styles.userName}>{currentUser.name}</div>
            <div style={styles.userRole}>{roleLabel}</div>
          </div>
        </div>
      )}
    </aside>
  );
}