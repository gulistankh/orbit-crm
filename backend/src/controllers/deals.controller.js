// src/controllers/deals.controller.js

import { query, withTransaction } from "../config/db.js";
import { HttpError } from "../middleware/errorHandler.js";
import { assertCanModify } from "../middleware/requirePermission.js";
import { buildInsert, buildUpdate } from "../utils/sql.js";
import { camelize, camelizeRows } from "../utils/mappers.js";
import { canAssignOwner, resolveOwnerId } from "../utils/permissions.js";

const STAGE_LABELS = {
  lead: "Lead",
  contacted: "Contacted",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export async function listDeals(req, res) {
  const { rows } = await query("SELECT * FROM deals ORDER BY created_at DESC");
  res.json(camelizeRows(rows));
}

export async function getDeal(req, res) {
  const { rows } = await query("SELECT * FROM deals WHERE id = $1", [req.params.id]);
  if (rows.length === 0) throw new HttpError(404, "Deal not found.");
  res.json(camelize(rows[0]));
}

export async function createDeal(req, res) {
  const values = {
    ...req.body,
    ownerId: resolveOwnerId(req.user, req.body.ownerId),
  };
  if (values.expectedCloseDate === "") values.expectedCloseDate = null;

  const insert = buildInsert("deals", values);
  const { rows } = await query(insert.text, insert.params);
  res.status(201).json(camelize(rows[0]));
}

// Shared by "edit a deal" and "move a deal to another stage".
async function saveDeal(req, res, values) {
  const { id } = req.params;

  const deal = await withTransaction(async (client) => {
    // FOR UPDATE locks the row so two people can't change it at the same moment
    const existing = await client.query("SELECT * FROM deals WHERE id = $1 FOR UPDATE", [id]);
    if (existing.rows.length === 0) throw new HttpError(404, "Deal not found.");

    const before = existing.rows[0];
    assertCanModify(req.user, "deals:edit", before.owner_id);

    const changes = { ...values };
    if (!canAssignOwner(req.user)) delete changes.ownerId;
    if (changes.expectedCloseDate === "") changes.expectedCloseDate = null;

    const update = buildUpdate("deals", id, changes);
    if (!update) throw new HttpError(400, "Nothing to update.");

    const updated = await client.query(update.text, update.params);
    const after = updated.rows[0];

    // A stage change leaves a line in the contact's activity log
    if (after.stage !== before.stage && after.contact_id) {
      await client.query(
        "INSERT INTO activities (contact_id, user_id, type, content) VALUES ($1, $2, 'note', $3)",
        [
          after.contact_id,
          req.user.id,
          `Deal "${after.title}" moved from ${STAGE_LABELS[before.stage]} to ${STAGE_LABELS[after.stage]}.`,
        ]
      );
    }

    return after;
  });

  res.json(camelize(deal));
}

export function updateDeal(req, res) {
  return saveDeal(req, res, req.body);
}

export function updateDealStage(req, res) {
  return saveDeal(req, res, { stage: req.body.stage });
}

export async function deleteDeal(req, res) {
  const { id } = req.params;

  const existing = await query("SELECT owner_id FROM deals WHERE id = $1", [id]);
  if (existing.rows.length === 0) throw new HttpError(404, "Deal not found.");
  assertCanModify(req.user, "deals:delete", existing.rows[0].owner_id);

  await query("DELETE FROM deals WHERE id = $1", [id]);
  res.json({ ok: true });
}