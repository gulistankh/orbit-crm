// src/middleware/validate.js
// Checks the request body against a zod schema. Unknown fields are dropped.
//   router.post("/login", validate(loginSchema), login)

import { HttpError } from "./errorHandler.js";
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      throw new HttpError(400, "Please check the form and try again.", details);
    }

    req.body = result.data;
    next();
  };
}