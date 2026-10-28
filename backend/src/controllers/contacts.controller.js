// src/controllers/contacts.controller.js

import { query, withTransaction } from "../config/db.js";
import { HttpError } from "../middleware/errorHandler.js";
import { assertCanModify } from "../middleware/requirePermission.js";
import { EMAIL_PATTERN } from "../middleware/validate.js";
import { buildInsert, buildUpdate } from "../utils/sql.js";
import { camelize, camelizeRows } from "../utils/mappers.js";
import { canAssignOwner, resolveOwnerId } from "../utils/permissions.js";

const STATUSES = ["lead", "active", "customer", "inactive"];

export async function listContacts(req, res) {
  const { rows } = await query("SELECT * FROM contacts ORDER BY created_at DESC");
  res.json(camelizeRows(rows));
}

export async function getContact(req, res) {
  const { rows } = await query("SELECT * FROM contacts WHERE id = $1", [req.params.id]);
  if (rows.length === 0) throw new HttpError(404, "Contact not found.");
  res.json(camelize(rows[0]));
}

export async function createContact(req, res) {
  const insert = buildInsert("contacts", {
    ...req.body,
    ownerId: resolveOwnerId(req.user, req.body.ownerId),
  });
  const { rows } = await query(insert.text, insert.params);
  res.status(201).json(camelize(rows[0]));
}

export async function updateContact(req, res) {
  const { id } = req.params;

  const existing = await query("SELECT owner_id FROM contacts WHERE id = $1", [id]);
  if (existing.rows.length === 0) throw new HttpError(404, "Contact not found.");
  assertCanModify(req.user, "contacts:edit", existing.rows[0].owner_id);

  const values = { ...req.body };
  if (!canAssignOwner(req.user)) delete values.ownerId;

  const update = buildUpdate("contacts", id, values);
  if (!update) throw new HttpError(400, "Nothing to update.");

  const { rows } = await query(update.text, update.params);
  res.json(camelize(rows[0]));
}

export async function deleteContact(req, res) {
  const { id } = req.params;

  const existing = await query("SELECT owner_id FROM contacts WHERE id = $1", [id]);
  if (existing.rows.length === 0) throw new HttpError(404, "Contact not found.");
  assertCanModify(req.user, "contacts:delete", existing.rows[0].owner_id);

  await query("DELETE FROM contacts WHERE id = $1", [id]);
  res.json({ ok: true });
}

// Bulk import from a parsed CSV. Skips rows with no name, a bad email, or an email
// that already exists. Creates companies that don't exist yet.
export async function importContacts(req, res) {
  const rows = req.body.rows;

  const result = await withTransaction(async (client) => {
    // 1. Decide which rows are importable
    const emailResult = await client.query(
      "SELECT lower(email) AS email FROM contacts WHERE email <> ''"
    );
    const seenEmails = new Set(emailResult.rows.map((row) => row.email));

    const toInsert = [];
    for (const row of rows) {
      const firstName = row.firstName || "";
      const lastName = row.lastName || "";
      const email = row.email || "";

      if (!firstName && !lastName) continue;
      if (email && !EMAIL_PATTERN.test(email)) continue;
      if (email) {
        const key = email.toLowerCase();
        if (seenEmails.has(key)) continue;
        seenEmails.add(key);
      }

      const status = (row.status || "").toLowerCase();
      toInsert.push({
        firstName,
        lastName,
        email,
        phone: row.phone || "",
        jobTitle: row.jobTitle || "",
        source: row.source || "Import",
        status: STATUSES.includes(status) ? status : "lead",
        companyName: row.companyName || "",
      });
    }

    if (toInsert.length === 0) {
      return { added: 0, skipped: rows.length, companiesCreated: 0 };
    }

    // 2. Match company names to existing companies, create the missing ones in one query
    const companyResult = await client.query("SELECT id, lower(name) AS key FROM companies");
    const companyIds = new Map(companyResult.rows.map((row) => [row.key, row.id]));

    const newNames = new Map();
    for (const item of toInsert) {
      const key = item.companyName.toLowerCase();
      if (key && !companyIds.has(key) && !newNames.has(key)) {
        newNames.set(key, item.companyName);
      }
    }

    if (newNames.size > 0) {
      const created = await client.query(
        `INSERT INTO companies (name, owner_id)
         SELECT name, $2::uuid FROM unnest($1::text[]) AS t(name)
         RETURNING id, lower(name) AS key`,
        [[...newNames.values()], req.user.id]
      );
      created.rows.forEach((row) => companyIds.set(row.key, row.id));
    }

    // 3. Insert all contacts in one query
    const column = (key) => toInsert.map((item) => item[key]);
    const companyColumn = toInsert.map(
      (item) => companyIds.get(item.companyName.toLowerCase()) || null
    );

    const inserted = await client.query(
      `INSERT INTO contacts (first_name, last_name, email, phone, job_title, source, status, company_id, owner_id)
       SELECT first_name, last_name, email, phone, job_title, source, status, company_id, $9::uuid
       FROM unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::text[], $8::uuid[])
         AS t(first_name, last_name, email, phone, job_title, source, status, company_id)
       ON CONFLICT (lower(email)) WHERE email <> '' DO NOTHING`,
      [
        column("firstName"),
        column("lastName"),
        column("email"),
        column("phone"),
        column("jobTitle"),
        column("source"),
        column("status"),
        companyColumn,
        req.user.id,
      ]
    );

    return {
      added: inserted.rowCount,
      skipped: rows.length - inserted.rowCount,
      companiesCreated: newNames.size,
    };
  });

  res.json(result);
}