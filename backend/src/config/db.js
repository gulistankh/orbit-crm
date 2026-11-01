// src/config/db.js
// The PostgreSQL connection, plus a helper for multi-step changes that must all succeed or all fail.

import pg from "pg";
import { config } from "./env.js";

const { Pool, types } = pg;

// numeric (deal values) -> a real number, not the string "48000.00"
types.setTypeParser(1700, (value) => parseFloat(value));

// date -> stays as "2026-11-15", no timezone shifting
types.setTypeParser(1082, (value) => value);

// bigint (what COUNT(*) returns) -> a real number
types.setTypeParser(20, (value) => parseInt(value, 10));

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: config.isProduction ? 5 : 10,
});

pool.on("error", (error) => {
  console.error("Unexpected database error:", error.message);
});

export function query(text, params) {
  return pool.query(text, params);
}

// Runs several queries as one unit. If anything throws, everything is rolled back.
//   await withTransaction(async (client) => {
//     await client.query("INSERT ...");
//     await client.query("UPDATE ...");
//   });
export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}