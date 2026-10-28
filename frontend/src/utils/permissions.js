// src/utils/permissions.js
// Who can do what. Permissions are strings like "contacts:edit".

export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  SALES_REP: "sales_rep",
  VIEWER: "viewer",
};

export const roleLabels = {
  admin: "Admin",
  manager: "Manager",
  sales_rep: "Sales Rep",
  viewer: "Viewer",
};

export const roleDescriptions = {
  admin: "Full access, including user management.",
  manager: "Create, edit and delete all records. Import and export data.",
  sales_rep: "Create records, edit only their own, export data.",
  viewer: "Read-only access.",
};

const viewAll = [
  "contacts:view",
  "companies:view",
  "deals:view",
  "activities:view",
];

export const rolePermissions = {
  // "*" means everything
  admin: ["*"],

  manager: [
    ...viewAll,
    "contacts:create", "contacts:edit", "contacts:delete",
    "companies:create", "companies:edit", "companies:delete",
    "deals:create", "deals:edit", "deals:delete",
    "activities:create", "activities:delete",
    "data:import", "data:export",
    "users:view",
  ],

  sales_rep: [
    ...viewAll,
    "contacts:create", "contacts:edit",
    "companies:create", "companies:edit",
    "deals:create", "deals:edit",
    "activities:create",
    "data:export",
  ],

  viewer: [...viewAll],
};

export function hasPermission(role, permission) {
  const list = rolePermissions[role] || [];
  return list.includes("*") || list.includes(permission);
}

// For edit/delete on a single record.
// Sales reps can only change records they own; managers and admins can change any.
export function canModifyRecord(user, permission, record) {
  if (!user) return false;
  if (!hasPermission(user.role, permission)) return false;
  if (user.role === ROLES.SALES_REP && record && record.ownerId) {
    return record.ownerId === user.id;
  }
  return true;
}