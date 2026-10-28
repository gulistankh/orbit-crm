// src/controllers/auth.controller.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { query } from "../config/db.js";
import { HttpError } from "../middleware/errorHandler.js";
import { COOKIE_NAME } from "../middleware/auth.js";
import { toUser } from "../utils/mappers.js";

// Used when the email doesn't exist, so a wrong email and a wrong password
// take the same time and can't be told apart.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "lax",
    path: "/",
  };
}

export async function login(req, res) {
  const { email, password } = req.body;

  const { rows } = await query("SELECT * FROM users WHERE lower(email) = lower($1)", [email]);
  const user = rows[0];

  const passwordOk = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !passwordOk) {
    throw new HttpError(401, "Invalid email or password.");
  }

  const token = jwt.sign({ sub: user.id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
  const { exp } = jwt.decode(token);

  res.cookie(COOKIE_NAME, token, {
    ...baseCookieOptions(),
    maxAge: exp * 1000 - Date.now(),
  });
  res.json({ user: toUser(user) });
}

export function logout(req, res) {
  res.clearCookie(COOKIE_NAME, baseCookieOptions());
  res.json({ ok: true });
}

export function me(req, res) {
  res.json({ user: req.user });
}