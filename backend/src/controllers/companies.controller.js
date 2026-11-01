// src/controllers/companies.controller.js

import { query } from "../config/db.js";
import { HttpError } from "../middleware/errorHandler.js";
import { assertCanModify } from "../middleware/requirePermission.js";
import { buildInsert, buildUpdate } from "../utils/sql.js";
import { camelize, camelizeRows } from "../utils/mappers.js";
import { canAssignOwner, resolveOwnerId } from "../utils/permissions.js";
import { createNotification } from "../utils/notify.js";

export async function listCompanies(req, res) {
  const { rows } = await query("SELECT * FROM companies ORDER BY name");
  res.json(camelizeRows(rows));
}

export async function getCompany(req, res) {
  const { rows } = await query("SELECT * FROM companies WHERE id = $1", [req.params.id]);
  if (rows.length === 0) throw new HttpError(404, "Company not found.");
  res.json(camelize(rows[0]));
}

export async function createCompany(req, res) {
  const insert = buildInsert("companies", {
    ...req.body,
    ownerId: resolveOwnerId(req.user, req.body.ownerId),
  });
  const { rows } = await query(insert.text, insert.params);
  const company = rows[0];

  // Only does something when an admin or manager gave it to someone else
  await createNotification({
    userId: company.owner_id,
    actorId: req.user.id,
    type: "assigned",
    message: `${req.user.name} assigned you the company ${company.name}.`,
    link: `/companies/${company.id}`,
  });

  res.status(201).json(camelize(company));
}

export async function updateCompany(req, res) {
  const { id } = req.params;

  const existing = await query("SELECT owner_id FROM companies WHERE id = $1", [id]);
  if (existing.rows.length === 0) throw new HttpError(404, "Company not found.");
  assertCanModify(req.user, "companies:edit", existing.rows[0].owner_id);

  const values = { ...req.body };
  if (!canAssignOwner(req.user)) delete values.ownerId; // sales reps can't hand records over

  const update = buildUpdate("companies", id, values);
  if (!update) throw new HttpError(400, "Nothing to update.");

  const { rows } = await query(update.text, update.params);
  const company = rows[0];

  // If the owner changed, tell the new owner
  if (company.owner_id !== existing.rows[0].owner_id) {
    await createNotification({
      userId: company.owner_id,
      actorId: req.user.id,
      type: "assigned",
      message: `${req.user.name} assigned you the company ${company.name}.`,
      link: `/companies/${company.id}`,
    });
  }

  res.json(camelize(company));
}

export async function deleteCompany(req, res) {
  const { id } = req.params;

  const existing = await query("SELECT owner_id FROM companies WHERE id = $1", [id]);
  if (existing.rows.length === 0) throw new HttpError(404, "Company not found.");
  assertCanModify(req.user, "companies:delete", existing.rows[0].owner_id);

  await query("DELETE FROM companies WHERE id = $1", [id]);
  res.json({ ok: true });
}