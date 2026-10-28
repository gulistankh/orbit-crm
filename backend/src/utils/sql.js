// src/utils/sql.js
// Small helpers that build INSERT and UPDATE statements.
//
// Column names come from our own zod schemas (which drop unknown fields),
// never straight from the request. Values always go in as $1, $2... parameters,
// so user input can never become part of the SQL text.

function toSnake(key) {
  if (!/^[a-zA-Z]+$/.test(key)) throw new Error(`Unsafe column name: ${key}`);
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function definedEntries(values) {
  return Object.entries(values).filter(([, value]) => value !== undefined);
}

// buildInsert("contacts", { firstName: "Ann" })
//  -> INSERT INTO contacts (first_name) VALUES ($1) RETURNING *
export function buildInsert(table, values) {
  const entries = definedEntries(values);
  const columns = entries.map(([key]) => toSnake(key));
  const placeholders = entries.map((_, index) => `$${index + 1}`);

  return {
    text: `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`,
    params: entries.map(([, value]) => value),
  };
}

// buildUpdate("contacts", id, { phone: "123" })
//  -> UPDATE contacts SET phone = $1 WHERE id = $2 RETURNING *
// Returns null when there is nothing to change.
export function buildUpdate(table, id, values) {
  const entries = definedEntries(values);
  if (entries.length === 0) return null;

  const assignments = entries.map(([key], index) => `${toSnake(key)} = $${index + 1}`);
  const params = entries.map(([, value]) => value);
  params.push(id);

  return {
    text: `UPDATE ${table} SET ${assignments.join(", ")} WHERE id = $${params.length} RETURNING *`,
    params,
  };
}