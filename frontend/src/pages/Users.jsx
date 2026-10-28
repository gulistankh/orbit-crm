// src/pages/Users.jsx
// Team members and what each role is allowed to do.
import { useData } from "../context/DataContext";
import DataTable from "../components/ui/DataTable";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import Select from "../components/ui/Select";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { roles } from "../data/mock";
import { roleLabels, roleDescriptions, hasPermission } from "../utils/permissions";
import {
  card,
  colors,
  pageTitle,
  spacing,
  fontSizes,
  fontWeights,
} from "../styles/theme";

// Rows of the permissions table. "special" overrides the tick for a role.
const capabilityRows = [
  { label: "View contacts, companies and deals", permission: "contacts:view" },
  { label: "Create contacts, companies and deals", permission: "contacts:create" },
  {
    label: "Edit records",
    permission: "contacts:edit",
    special: { sales_rep: "Own only" },
  },
  { label: "Delete records", permission: "contacts:delete" },
  { label: "Log notes, calls and meetings", permission: "activities:create" },
  { label: "Delete activity entries", permission: "activities:delete" },
  { label: "Import CSV", permission: "data:import" },
  { label: "Export CSV", permission: "data:export" },
  { label: "Manage users and roles", permission: "users:manage" },
];

const styles = {
  header: { marginBottom: spacing.xl },
  subtitle: {
    margin: "6px 0 0",
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  userCell: { display: "flex", alignItems: "center", gap: spacing.md },
  userName: { fontWeight: fontWeights.medium, color: colors.textPrimary },
  userEmail: { fontSize: fontSizes.xs, color: colors.textMuted },
  roleSelect: { maxWidth: 180 },
  youTag: { marginLeft: spacing.sm },
  description: { fontSize: fontSizes.sm, color: colors.textSecondary },
  section: { ...card, padding: spacing.xl, marginTop: spacing.xl },
  sectionTitle: {
    margin: `0 0 ${spacing.xs}px`,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  sectionText: {
    margin: `0 0 ${spacing.lg}px`,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  matrixWrap: { overflowX: "auto" },
  matrix: { width: "100%", borderCollapse: "collapse", minWidth: 560 },
  th: {
    padding: "10px 12px",
    textAlign: "center",
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    borderBottom: `1px solid ${colors.border}`,
  },
  thFirst: { textAlign: "left" },
  td: {
    padding: "10px 12px",
    textAlign: "center",
    fontSize: fontSizes.md,
    borderBottom: `1px solid ${colors.border}`,
  },
  tdFirst: { textAlign: "left", color: colors.textPrimary },
  yes: { color: colors.success, fontWeight: fontWeights.bold },
  no: { color: colors.borderStrong },
  partial: { color: colors.warning, fontSize: fontSizes.sm, fontWeight: fontWeights.medium },
};

export default function Users() {
  const { users, currentUser, updateUserRole } = useAuth();
  const { can } = usePermissions();
  const canManage = can("users:manage");
  const { notify } = useData();
  const roleOptions = roles.map((role) => ({ value: role, label: roleLabels[role] }));

  const columns = [
    {
      key: "name",
      header: "User",
      sortable: true,
      render: (user) => (
        <div style={styles.userCell}>
          <Avatar name={user.name} size={36} />
          <div>
            <div style={styles.userName}>
              {user.name}
              {currentUser && user.id === currentUser.id && (
                <span style={styles.youTag}>
                  <Badge tone="neutral">You</Badge>
                </span>
              )}
            </div>
            <div style={styles.userEmail}>{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      sortValue: (user) => roles.indexOf(user.role),
      render: (user) => {
        const isSelf = currentUser && user.id === currentUser.id;
        // Admins can change roles, but not their own (so there is always an admin)
        if (canManage && !isSelf) {
          return (
            <div style={styles.roleSelect}>
              <Select
                aria-label={`Role for ${user.name}`}
                options={roleOptions}
                value={user.role}
                onChange={async (event) => {
                const result = await updateUserRole(user.id, event.target.value);
                if (!result.ok) notify(result.error);
                }}
              />
            </div>
          );
        }
        return <Badge tone="primary">{roleLabels[user.role]}</Badge>;
      },
    },
    {
      key: "access",
      header: "Access",
      render: (user) => <span style={styles.description}>{roleDescriptions[user.role]}</span>,
    },
  ];

  return (
    <div>
      <div style={styles.header}>
        <h1 style={pageTitle}>Users & roles</h1>
        <p style={styles.subtitle}>
          {canManage
            ? "Change a role and the new permissions apply right away."
            : "You can see who is on the team and what each role can do."}
        </p>
      </div>

      <DataTable columns={columns} rows={users} pageSize={10} />

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>What each role can do</h2>
        <p style={styles.sectionText}>
          Sales reps can create records, but they can only edit the ones they own.
        </p>

        <div style={styles.matrixWrap}>
          <table style={styles.matrix}>
            <thead>
              <tr>
                <th style={{ ...styles.th, ...styles.thFirst }}>Capability</th>
                {roles.map((role) => (
                  <th key={role} style={styles.th}>
                    {roleLabels[role]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {capabilityRows.map((row) => (
                <tr key={row.label}>
                  <td style={{ ...styles.td, ...styles.tdFirst }}>{row.label}</td>
                  {roles.map((role) => {
                    const special = row.special && row.special[role];
                    let cell;
                    if (special) cell = <span style={styles.partial}>{special}</span>;
                    else if (hasPermission(role, row.permission))
                      cell = <span style={styles.yes}>✓</span>;
                    else cell = <span style={styles.no}>–</span>;
                    return (
                      <td key={role} style={styles.td}>
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}