// src/utils/permissions.js
// Who can do what. Keep in sync with frontend/src/utils/permissions.js.
// The frontend only HIDES buttons. This file is what actually enforces the rules.

export const ROLES = ["admin", "manager", "sales_rep", "viewer"];

const viewAll = ["contacts:view", "companies:view", "deals:view", "activities:view"];

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

// For changing one existing record.
// Sales reps may only change records they own. Admins and managers can change any.
export function canModifyRecord(user, permission, ownerId) {
  if (!user || !hasPermission(user.role, permission)) return false;
  if (user.role === "sales_rep") return ownerId === user.id;
  return true;
}
// Only admins and managers may assign a record to someone else.
export function canAssignOwner(user) {
  return user.role === "admin" || user.role === "manager";
}

// New records belong to whoever creates them, unless an admin or manager picks someone.
export function resolveOwnerId(user, requestedOwnerId) {
  return canAssignOwner(user) && requestedOwnerId ? requestedOwnerId : user.id;
}