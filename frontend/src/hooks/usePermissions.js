// src/hooks/usePermissions.js
// Components ask this hook what the current user is allowed to do.
//   const { can, canModify } = usePermissions();
//   can("contacts:create")              -> show the "Add contact" button?
//   canModify("contacts:edit", contact) -> show the edit button on this row?

import { useAuth } from "../context/AuthContext";
import { hasPermission, canModifyRecord, roleLabels } from "../utils/permissions";

export function usePermissions() {
  const { currentUser } = useAuth();
  const role = currentUser ? currentUser.role : null;

  return {
    role,
    roleLabel: role ? roleLabels[role] : "",
    can: (permission) => (role ? hasPermission(role, permission) : false),
    canModify: (permission, record) => canModifyRecord(currentUser, permission, record),
  };
}
