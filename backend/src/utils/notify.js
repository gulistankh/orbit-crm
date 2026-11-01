// src/utils/notify.js
// Creates a notification for one person.
//   await createNotification({ userId, actorId, type, message, link })
// Nobody is ever notified about their own action, so userId === actorId does nothing.
// Pass a transaction client as the second argument to make it part of that transaction.

import { query } from "../config/db.js";

export async function createNotification(details, client) {
  const { userId, actorId, type, message, link = "" } = details;
  if (!userId || userId === actorId) return;

  const run = client ? client.query.bind(client) : query;

  try {
    await run(
      `INSERT INTO notifications (user_id, actor_id, type, message, link)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, actorId || null, type, String(message).slice(0, 300), link]
    );
  } catch (error) {
    // Inside a transaction a failure must roll everything back.
    // Outside one, the main action already succeeded, so just log it.
    if (client) throw error;
    console.error("Could not create notification:", error.message);
  }
}