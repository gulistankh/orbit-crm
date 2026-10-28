// src/app.js
// Builds the Express app. Routes get mounted here as we write them.

import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { config } from "./config/env.js";
import { query } from "./config/db.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import companiesRoutes from "./routes/companies.routes.js";
import contactsRoutes from "./routes/contacts.routes.js";
import dealsRoutes from "./routes/deals.routes.js";
import activitiesRoutes from "./routes/activities.routes.js";

const app = express();

// Behind a hosting proxy (Vercel, Render...) so rate limits see the real IP
if (config.isProduction) app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", async (req, res) => {
  await query("SELECT 1");
  res.json({ status: "ok", database: "connected" });
});

// A general safety net against floods of requests
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests. Please slow down." },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/deals", dealsRoutes);
app.use("/api", activitiesRoutes);
// More routes will be mounted here

app.use(notFoundHandler);
app.use(errorHandler);

export default app;