// src/routes/notifications.routes.js

import { Router } from "express";
import {
  listNotifications,
  markRead,
  markAllRead,
} from "../controllers/notifications.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// Any signed-in user, but only ever their own notifications
router.get("/", listNotifications);
router.post("/read-all", markAllRead);
router.patch("/:id/read", markRead);

export default router;