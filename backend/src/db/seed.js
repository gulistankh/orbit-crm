// src/db/seed.js
// Fills the database with the demo users and sample data.
//   npm run seed              (only if the database is empty)
//   npm run seed -- --reset   (wipes everything first)

import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { config } from "../config/env.js";
import { pool, withTransaction } from "../config/db.js";
import { users, companies, contacts, deals, activities } from "./seedData.js";

const DEMO_PASSWORD = "demo1234";
const reset = process.argv.includes("--reset");

// The sample data uses ids like "c1" and "ct4". The database needs real UUIDs,
// so each old id gets one new UUID, and the links between records stay intact.
const idMap = new Map();
function newId(oldId) {
  if (!oldId) return null;
  if (!idMap.has(oldId)) idMap.set(oldId, randomUUID());
  return idMap.get(oldId);
}

function databaseHost() {
  try {
    return new URL(config.databaseUrl).host;
  } catch {
    return "unknown host";
  }
}

async function seed() {
  console.log(`Seeding the database on ${databaseHost()}`);

  const { rows } = await pool.query("SELECT count(*) AS count FROM users");
  if (rows[0].count > 0 && !reset) {
    console.log('The database already has users. Run "npm run seed -- --reset" to wipe it and start over.');
    return;
  }

  await withTransaction(async (client) => {
    if (reset) {
      await client.query("TRUNCATE activities, deals, contacts, companies, users CASCADE");
    }

    for (const user of users) {
      const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
      await client.query(
        "INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)",
        [newId(user.id), user.name, user.email, hash, user.role]
      );
    }

    for (const c of companies) {
      await client.query(
        `INSERT INTO companies (id, name, industry, website, employees, city, country, owner_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [newId(c.id), c.name, c.industry, c.website, c.employees, c.city, c.country, newId(c.ownerId), c.createdAt]
      );
    }

    for (const c of contacts) {
      await client.query(
        `INSERT INTO contacts (id, first_name, last_name, email, phone, job_title, source, status, company_id, owner_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [newId(c.id), c.firstName, c.lastName, c.email, c.phone, c.jobTitle, c.source, c.status, newId(c.companyId), newId(c.ownerId), c.createdAt]
      );
    }

    for (const d of deals) {
      await client.query(
        `INSERT INTO deals (id, title, value, stage, contact_id, company_id, owner_id, expected_close_date, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [newId(d.id), d.title, d.value, d.stage, newId(d.contactId), newId(d.companyId), newId(d.ownerId), d.expectedCloseDate || null, d.createdAt]
      );
    }

    for (const a of activities) {
      await client.query(
        `INSERT INTO activities (id, contact_id, user_id, type, content, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [newId(a.id), newId(a.contactId), newId(a.userId), a.type, a.content, a.createdAt]
      );
    }
  });

  console.log(
    `Done: ${users.length} users, ${companies.length} companies, ${contacts.length} contacts, ` +
      `${deals.length} deals, ${activities.length} activities.`
  );
  console.log(`Demo password for every user: ${DEMO_PASSWORD}`);
}

seed()
  .catch((error) => {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());