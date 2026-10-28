// src/middleware/errorHandler.js

// Throw this from anywhere: throw new HttpError(403, "You can't do that.")
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: "Route not found." });
}

const uniqueMessages = {
  contacts_email_unique: "A contact with this email already exists.",
  users_email_unique: "A user with this email already exists.",
};

// Express recognizes an error handler by its 4 parameters, so keep `next`.
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message, details: error.details });
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON in the request body." });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ error: "The request is too large." });
  }

  // PostgreSQL error codes
  switch (error.code) {
    case "23505": // unique violation
      return res
        .status(409)
        .json({ error: uniqueMessages[error.constraint] || "That value already exists." });
    case "23503": // foreign key violation
      return res.status(400).json({ error: "A linked record doesn't exist." });
    case "23502": // not null violation
    case "23514": // check violation
      return res.status(400).json({ error: "Some values are not allowed." });
    case "22P02": // invalid text representation (for example a bad id)
      return res.status(400).json({ error: "Invalid id or value format." });
          case "22007": // invalid date format
    case "22008": // date out of range
      return res.status(400).json({ error: "That date isn't valid." });
    case "22003": // number out of range
      return res.status(400).json({ error: "That number is too large." });
    default:
      break;
  }

  console.error(error);
  return res.status(500).json({ error: "Something went wrong on the server." });
}