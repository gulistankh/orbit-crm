// src/middleware/auth.js
// Reads the login token, finds the user, and puts them on req.user.

import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { query } from "../config/db.js";
import { HttpError } from "./errorHandler.js";
import { toUser } from "../utils/mappers.js";

export const COOKIE_NAME = "crm_token";

function getToken(req) {
  if (req.cookies && req.cookies[COOKIE_NAME]) return req.cookies[COOKIE_NAME];
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return null;
}

export async function authenticate(req, res, next) {
  const token = getToken(req);
  if (!token) throw new HttpError(401, "Please sign in.");

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
  } catch {
    throw new HttpError(401, "Your session has expired. Please sign in again.");
  }

  const { rows } = await query(
    "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
    [payload.sub]
  );
  if (rows.length === 0) throw new HttpError(401, "Please sign in.");

  req.user = toUser(rows[0]);
  next();
}