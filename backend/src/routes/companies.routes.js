// src/routes/companies.routes.js

import { Router } from "express";
import { z } from "zod";
import {
  listCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../controllers/companies.controller.js";
import { authenticate } from "../middleware/auth.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { validate } from "../middleware/validate.js";

const fields = {
  name: z.string().trim().min(1, "Company name is required.").max(200),
  industry: z.string().trim().max(100).optional(),
  website: z.string().trim().max(300).optional(),
  employees: z.number().int().min(0).max(10000000).optional(),
  city: z.string().trim().max(100).optional(),
  country: z.string().trim().max(100).optional(),
  ownerId: z.string().uuid().optional(),
};

const createSchema = z.object(fields);
const updateSchema = z.object(fields).partial();

const router = Router();
router.use(authenticate);

router.get("/", requirePermission("companies:view"), listCompanies);
router.get("/:id", requirePermission("companies:view"), getCompany);
router.post("/", requirePermission("companies:create"), validate(createSchema), createCompany);
router.patch("/:id", requirePermission("companies:edit"), validate(updateSchema), updateCompany);
router.delete("/:id", requirePermission("companies:delete"), deleteCompany);

export default router;