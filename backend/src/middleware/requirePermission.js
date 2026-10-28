// src/middleware/requirePermission.js

import { HttpError } from "./errorHandler.js";
import { hasPermission, canModifyRecord } from "../utils/permissions.js";

// Use on a route: router.post("/", requirePermission("contacts:create"), create)
export function requirePermission(permission) {
  return (req, res, next) => {
    if (!hasPermission(req.user.role, permission)) {
      throw new HttpError(403, "You don't have permission to do that.");
    }
    next();
  };
}

// Use inside a controller after loading the record:
// sales reps can only change records they own.
export function assertCanModify(user, permission, ownerId) {
  if (!canModifyRecord(user, permission, ownerId)) {
    throw new HttpError(403, "You don't have permission to change this record.");
  }
}