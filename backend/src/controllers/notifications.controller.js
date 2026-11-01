// src/controllers/notifications.controller.js

import { query } from "../config/db.js";
import { HttpError } from "../middleware/errorHandler.js";
import { camelize, camelizeRows } from "../utils/mappers.js";

// The current user's notifications, newest first, plus how many are unread
export async function listNotifications(req, res) {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);

  const [list, unread] = await Promise.all([
    query(
      `SELECT n.*, u.name AS actor_name
       FROM notifications n
       LEFT JOIN users u ON u.id = n.actor_id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT $2`,
      [req.user.id, limit]
    ),
    query(
      "SELECT count(*) AS count FROM notifications WHERE user_id = $1 AND read_at IS NULL",
      [req.user.id]
    ),
  ]);

  res.json({
    notifications: camelizeRows(list.rows),
    unreadCount: unread.rows[0].count,
  });
}

export async function markRead(req, res) {
  const { rows } = await query(
    `UPDATE notifications
     SET read_at = COALESCE(read_at, now())
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [req.params.id, req.user.id]
  );
  if (rows.length === 0) throw new HttpError(404, "Notification not found.");

  res.json(camelize(rows[0]));
}

export async function markAllRead(req, res) {
  const { rowCount } = await query(
    "UPDATE notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL",
    [req.user.id]
  );
  res.json({ ok: true, updated: rowCount });
}