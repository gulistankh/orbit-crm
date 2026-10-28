// src/routes/activities.routes.js

import { Router } from "express";
import { z } from "zod";
import {
  listRecentActivities,
  listContactActivities,
  createActivity,
  deleteActivity,
} from "../controllers/activities.controller.js";
import { authenticate } from "../middleware/auth.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { validate } from "../middleware/validate.js";

const createSchema = z.object({
  type: z.enum(["note", "call", "email", "meeting"]),
  content: z.string().trim().min(1, "Write something first.").max(2000),
});

const router = Router();

router.get("/activities", authenticate, requirePermission("activities:view"), listRecentActivities);
router.delete("/activities/:id", authenticate, requirePermission("activities:delete"), deleteActivity);

router.get(
  "/contacts/:contactId/activities",
  authenticate,
  requirePermission("activities:view"),
  listContactActivities
);
router.post(
  "/contacts/:contactId/activities",
  authenticate,
  requirePermission("activities:create"),
  validate(createSchema),
  createActivity
);

export default router;