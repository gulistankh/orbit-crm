// src/routes/users.routes.js

import { Router } from "express";
import { z } from "zod";
import { listUsers, updateUserRole } from "../controllers/users.controller.js";
import { authenticate } from "../middleware/auth.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { validate } from "../middleware/validate.js";

const roleSchema = z.object({
  role: z.enum(["admin", "manager", "sales_rep", "viewer"]),
});

const router = Router();
router.use(authenticate);

router.get("/", listUsers);
router.patch("/:id/role", requirePermission("users:manage"), validate(roleSchema), updateUserRole);

export default router;