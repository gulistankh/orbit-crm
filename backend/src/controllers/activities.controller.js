// src/controllers/activities.controller.js

import { query } from "../config/db.js";
import { HttpError } from "../middleware/errorHandler.js";
import { camelize, camelizeRows } from "../utils/mappers.js";
import { createNotification } from "../utils/notify.js";

// Newest activity across all contacts (for the Dashboard feed)
export async function listRecentActivities(req, res) {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const { rows } = await query("SELECT * FROM activities ORDER BY created_at DESC LIMIT $1", [limit]);
  res.json(camelizeRows(rows));
}

export async function listContactActivities(req, res) {
  const { contactId } = req.params;

  const contact = await query("SELECT 1 FROM contacts WHERE id = $1", [contactId]);
  if (contact.rows.length === 0) throw new HttpError(404, "Contact not found.");

  const { rows } = await query(
    "SELECT * FROM activities WHERE contact_id = $1 ORDER BY created_at DESC",
    [contactId]
  );
  res.json(camelizeRows(rows));
}

export async function createActivity(req, res) {
  // The author is always the logged-in user, never something the client sends
  const { rows } = await query(
    `INSERT INTO activities (contact_id, user_id, type, content)
     SELECT id, $2::uuid, $3::text, $4::text FROM contacts WHERE id = $1
     RETURNING *`,
    [req.params.contactId, req.user.id, req.body.type, req.body.content]
  );
  if (rows.length === 0) throw new HttpError(404, "Contact not found.");
  const activity = rows[0];

  // Tell the contact's owner (unless they logged it themselves)
  const contact = await query(
    "SELECT first_name, last_name, owner_id FROM contacts WHERE id = $1",
    [activity.contact_id]
  );
  if (contact.rows.length > 0) {
    const { first_name, last_name, owner_id } = contact.rows[0];
    const contactName = `${first_name} ${last_name}`.trim();

    await createNotification({
      userId: owner_id,
      actorId: req.user.id,
      type: "activity_logged",
      message: `${req.user.name} logged a ${activity.type} on ${contactName}.`,
      link: `/contacts/${activity.contact_id}`,
    });
  }

  res.status(201).json(camelize(activity));
}

export async function deleteActivity(req, res) {
  const { rowCount } = await query("DELETE FROM activities WHERE id = $1", [req.params.id]);
  if (rowCount === 0) throw new HttpError(404, "Activity not found.");
  res.json({ ok: true });
}