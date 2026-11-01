// src/server.js
// Starts the server.

import app from "./app.js";
import { config } from "./config/env.js";
import { pool } from "./config/db.js";

const server = app.listen(config.port, () => {
  console.log(`API running on http://localhost:${config.port}`);
});

pool
  .query("SELECT 1")
  .then(() => console.log("Database connected"))
  .catch((error) => console.error("Database connection failed:", error.message));

function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);