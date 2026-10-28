// src/routes/auth.routes.js

import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { login, logout, me } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email.").max(254),
  password: z.string().min(1, "Enter your password.").max(200),
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many failed login attempts. Try again in 15 minutes." },
});

const router = Router();

router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", authenticate, me);

export default router;