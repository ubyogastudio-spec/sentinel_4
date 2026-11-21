CREATE TABLE IF NOT EXISTS contact_messages (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  request_id    TEXT        NOT NULL UNIQUE,
  full_name     TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  phone         TEXT,
  topic         TEXT        NOT NULL CHECK (topic IN ('general','call','support','careers','press')),
  message       TEXT        NOT NULL,
  locale        TEXT        NOT NULL DEFAULT 'mn' CHECK (locale IN ('mn','en')),
  consent_given BOOLEAN     NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'new' CHECK (status IN ('new','handled','spam')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quote_requests (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  request_id        TEXT        NOT NULL UNIQUE,
  full_name         TEXT        NOT NULL,
  company           TEXT,
  email             TEXT        NOT NULL,
  phone             TEXT        NOT NULL,
  service           TEXT        NOT NULL CHECK (service IN ('surveillance','access','network','audit')),
  site_type         TEXT        NOT NULL CHECK (site_type IN ('office','retail','warehouse','residential','industrial','other')),
  product           TEXT        CHECK (product IS NULL OR product IN ('camera','reader','hub')),
  preferred_contact TEXT        NOT NULL CHECK (preferred_contact IN ('phone','email')),
  details           TEXT        NOT NULL,
  locale            TEXT        NOT NULL DEFAULT 'mn' CHECK (locale IN ('mn','en')),
  consent_given     BOOLEAN     NOT NULL,
  status            TEXT        NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','closed','spam')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created   ON quote_requests (created_at DESC);

-- Supabase exposes public tables through its own web API. The app never uses that API,
-- so lock it: with RLS on and no policies, the public key can read and write nothing.
-- The server connects as the database owner, which bypasses RLS.
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests   ENABLE ROW LEVEL SECURITY;
