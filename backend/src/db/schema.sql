-- backend/src/db/schema.sql
-- Orbit CRM database schema (PostgreSQL 13 or newer)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Keeps updated_at current whenever a row is changed
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------
-- users
-- ---------------------------------------------------------------
CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL CHECK (length(trim(name)) > 0),
  email         text NOT NULL,
  password_hash text NOT NULL,
  role          text NOT NULL DEFAULT 'viewer'
                CHECK (role IN ('admin', 'manager', 'sales_rep', 'viewer')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX users_email_unique ON users (lower(email));

-- ---------------------------------------------------------------
-- companies
-- ---------------------------------------------------------------
CREATE TABLE companies (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL CHECK (length(trim(name)) > 0),
  industry   text NOT NULL DEFAULT '',
  website    text NOT NULL DEFAULT '',
  employees  integer NOT NULL DEFAULT 0 CHECK (employees >= 0),
  city       text NOT NULL DEFAULT '',
  country    text NOT NULL DEFAULT '',
  owner_id   uuid REFERENCES users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX companies_owner_idx ON companies (owner_id);

-- ---------------------------------------------------------------
-- contacts
-- ---------------------------------------------------------------
CREATE TABLE contacts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL DEFAULT '',
  last_name  text NOT NULL DEFAULT '',
  email      text NOT NULL DEFAULT '',
  phone      text NOT NULL DEFAULT '',
  job_title  text NOT NULL DEFAULT '',
  source     text NOT NULL DEFAULT '',
  status     text NOT NULL DEFAULT 'lead'
             CHECK (status IN ('lead', 'active', 'customer', 'inactive')),
  company_id uuid REFERENCES companies (id) ON DELETE SET NULL,
  owner_id   uuid REFERENCES users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- a contact needs at least a first or a last name
  CONSTRAINT contacts_has_name
    CHECK (length(trim(first_name)) > 0 OR length(trim(last_name)) > 0)
);

-- No two contacts with the same email (empty emails are allowed)
CREATE UNIQUE INDEX contacts_email_unique ON contacts (lower(email)) WHERE email <> '';
CREATE INDEX contacts_company_idx ON contacts (company_id);
CREATE INDEX contacts_owner_idx   ON contacts (owner_id);
CREATE INDEX contacts_status_idx  ON contacts (status);

-- ---------------------------------------------------------------
-- deals
-- ---------------------------------------------------------------
CREATE TABLE deals (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text NOT NULL CHECK (length(trim(title)) > 0),
  value               numeric(12, 2) NOT NULL DEFAULT 0 CHECK (value >= 0),
  stage               text NOT NULL DEFAULT 'lead'
                      CHECK (stage IN ('lead', 'contacted', 'proposal', 'negotiation', 'won', 'lost')),
  contact_id          uuid REFERENCES contacts (id) ON DELETE SET NULL,
  company_id          uuid REFERENCES companies (id) ON DELETE SET NULL,
  owner_id            uuid REFERENCES users (id) ON DELETE SET NULL,
  expected_close_date date,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX deals_stage_idx   ON deals (stage);
CREATE INDEX deals_contact_idx ON deals (contact_id);
CREATE INDEX deals_company_idx ON deals (company_id);
CREATE INDEX deals_owner_idx   ON deals (owner_id);

-- ---------------------------------------------------------------
-- activities (notes, calls, emails, meetings on a contact)
-- ---------------------------------------------------------------
CREATE TABLE activities (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts (id) ON DELETE CASCADE,
  user_id    uuid REFERENCES users (id) ON DELETE SET NULL,
  type       text NOT NULL DEFAULT 'note'
             CHECK (type IN ('note', 'call', 'email', 'meeting')),
  content    text NOT NULL
             CHECK (length(trim(content)) > 0 AND length(content) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX activities_contact_idx ON activities (contact_id, created_at DESC);
CREATE INDEX activities_created_idx ON activities (created_at DESC);

-- ---------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER companies_set_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER contacts_set_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER deals_set_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();