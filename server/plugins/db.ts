import { runMigrations } from "@agent-native/core/db";

export default runMigrations(
  [
    {
      version: 1,
      name: "scholarship-hunter-tables",
      sql: `CREATE TABLE IF NOT EXISTS scholarships (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  country TEXT NOT NULL,
  levels TEXT[] NOT NULL,
  fields TEXT[] NOT NULL,
  amount TEXT NOT NULL,
  deadline TEXT,
  deadline_note TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'closed', 'rolling')),
  eligibility_note TEXT NOT NULL,
  url TEXT NOT NULL,
  requirements TEXT[] NOT NULL,
  description TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_on TEXT NOT NULL,
  source_note TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS profiles (
  viewer_id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL CHECK (level IN ('bachelors', 'masters', 'phd', 'postdoc')),
  field TEXT NOT NULL,
  country TEXT NOT NULL,
  target_countries TEXT[] NOT NULL DEFAULT '{}',
  graduation_year INTEGER,
  notes TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (now())
);
CREATE TABLE IF NOT EXISTS tracked (
  id TEXT PRIMARY KEY,
  viewer_id TEXT NOT NULL,
  scholarship_slug TEXT NOT NULL REFERENCES scholarships(slug),
  status TEXT NOT NULL DEFAULT 'interested' CHECK (status IN ('interested', 'shortlisted', 'applied', 'submitted', 'won', 'rejected')),
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (now()),
  UNIQUE (viewer_id, scholarship_slug)
);
CREATE INDEX IF NOT EXISTS scholarships_status_deadline_idx ON scholarships (status, deadline);
CREATE INDEX IF NOT EXISTS tracked_viewer_idx ON tracked (viewer_id);`,
    },
  ],
  { table: "scholarship_hunter_migrations" },
);
