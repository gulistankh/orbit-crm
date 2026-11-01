// src/controllers/users.controller.js

import { query } from "../config/db.js";
import { HttpError } from "../middleware/errorHandler.js";
import { toUser } from "../utils/mappers.js";
import { hasPermission } from "../utils/permissions.js";
import { createNotification } from "../utils/notify.js";

const ROLE_LABELS = {
  admin: "Admin",
  manager: "Manager",
  sales_rep: "Sales Rep",
  viewer: "Viewer",
};

// Everyone who is signed in gets names and roles (needed for owner names and filters).
// Email addresses are only shown to admins and managers.
export async function listUsers(req, res) {
  const canSeeEmails = hasPermission(req.user.role, "users:view");

  const { rows } = await query(
    "SELECT id, name, email, role, created_at FROM users ORDER BY name"
  );

  res.json(
    rows.map((row) => {
      const user = toUser(row);
      if (!canSeeEmails) delete user.email;
      return user;
    })
  );
}

export async function updateUserRole(req, res) {
  const { id } = req.params;

  // So there can never be a moment with no admin
  if (id === req.user.id) {
    throw new HttpError(400, "You can't change your own role.");
  }

  const { rows } = await query(
    "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role, created_at",
    [req.body.role, id]
  );
  if (rows.length === 0) throw new HttpError(404, "User not found.");

  await createNotification({
    userId: id,
    actorId: req.user.id,
    type: "role_changed",
    message: `${req.user.name} changed your role to ${ROLE_LABELS[req.body.role]}.`,
  });

  res.json(toUser(rows[0]));
}