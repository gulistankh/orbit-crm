// src/routes/contacts.routes.js

import { Router } from "express";
import { z } from "zod";
import {
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  importContacts,
} from "../controllers/contacts.controller.js";
import { authenticate } from "../middleware/auth.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { validate, EMAIL_PATTERN } from "../middleware/validate.js";

const email = z
  .string()
  .trim()
  .max(254)
  .refine((value) => value === "" || EMAIL_PATTERN.test(value), "Enter a valid email address.");

const fields = {
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  email: email.optional(),
  phone: z.string().trim().max(50).optional(),
  jobTitle: z.string().trim().max(150).optional(),
  source: z.string().trim().max(100).optional(),
  status: z.enum(["lead", "active", "customer", "inactive"]).optional(),
  companyId: z.string().uuid().nullable().optional(),
  ownerId: z.string().uuid().optional(),
};

const createSchema = z.object(fields).refine((data) => data.firstName || data.lastName, {
  message: "Enter a first or last name.",
  path: ["firstName"],
});

const updateSchema = z.object(fields);

// One row of a CSV import. Anything missing is treated as empty.
const importRow = z.object({
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  email: z.string().trim().max(254).optional(),
  phone: z.string().trim().max(50).optional(),
  jobTitle: z.string().trim().max(150).optional(),
  companyName: z.string().trim().max(200).optional(),
  status: z.string().trim().max(30).optional(),
  source: z.string().trim().max(100).optional(),
});

const importSchema = z.object({
  rows: z.array(importRow).min(1, "The file has no rows.").max(2000, "Import up to 2000 rows at a time."),
});

const router = Router();
router.use(authenticate);

router.get("/", requirePermission("contacts:view"), listContacts);
router.post("/import", requirePermission("data:import"), validate(importSchema), importContacts);
router.get("/:id", requirePermission("contacts:view"), getContact);
router.post("/", requirePermission("contacts:create"), validate(createSchema), createContact);
router.patch("/:id", requirePermission("contacts:edit"), validate(updateSchema), updateContact);
router.delete("/:id", requirePermission("contacts:delete"), deleteContact);

export default router;