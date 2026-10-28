// src/routes/deals.routes.js

import { Router } from "express";
import { z } from "zod";
import {
  listDeals,
  getDeal,
  createDeal,
  updateDeal,
  updateDealStage,
  deleteDeal,
} from "../controllers/deals.controller.js";
import { authenticate } from "../middleware/auth.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { validate } from "../middleware/validate.js";

const stage = z.enum(["lead", "contacted", "proposal", "negotiation", "won", "lost"]);

// "" means no date. Otherwise it must look like 2026-11-30.
const closeDate = z.union([
  z.literal(""),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date like 2026-11-30."),
]);

const fields = {
  title: z.string().trim().min(1, "Deal title is required.").max(200),
  value: z.number().min(0, "Value can't be negative.").max(9999999999.99),
  stage: stage.optional(),
  contactId: z.string().uuid().nullable().optional(),
  companyId: z.string().uuid().nullable().optional(),
  expectedCloseDate: closeDate.nullable().optional(),
  ownerId: z.string().uuid().optional(),
};

const createSchema = z.object(fields); // title and value are required
const updateSchema = z.object(fields).partial();
const stageSchema = z.object({ stage });

const router = Router();
router.use(authenticate);

router.get("/", requirePermission("deals:view"), listDeals);
router.get("/:id", requirePermission("deals:view"), getDeal);
router.post("/", requirePermission("deals:create"), validate(createSchema), createDeal);
router.patch("/:id/stage", requirePermission("deals:edit"), validate(stageSchema), updateDealStage);
router.patch("/:id", requirePermission("deals:edit"), validate(updateSchema), updateDeal);
router.delete("/:id", requirePermission("deals:delete"), deleteDeal);

export default router;