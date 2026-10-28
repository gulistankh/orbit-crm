// src/utils/mappers.js
// The database uses snake_case (first_name). The API sends camelCase (firstName),
// which is what the frontend already expects.

function toCamel(key) {
  return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function camelize(row) {
  if (!row) return row;
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [toCamel(key), value]));
}

export function camelizeRows(rows) {
  return rows.map(camelize);
}

// A user as the API shows it. The password hash is never included.
export function toUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  };
}