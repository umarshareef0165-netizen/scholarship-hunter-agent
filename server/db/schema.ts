import { sql } from "drizzle-orm";
import { boolean, integer, pgTable, text } from "drizzle-orm/pg-core";

/**
 * Reference data: real scholarship programmes. Seeded from
 * server/db/seed-scholarships.ts (verified entries only). Read-only for
 * the UI/agent; only the seed step writes here.
 */
export const scholarships = pgTable("scholarships", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  country: text("country").notNull(),
  levels: text("levels").array().notNull(),
  fields: text("fields").array().notNull(),
  amount: text("amount").notNull(),
  /** ISO date (YYYY-MM-DD) or null when there is no single confirmed date */
  deadline: text("deadline"),
  deadlineNote: text("deadline_note").notNull(),
  status: text("status", { enum: ["open", "closed", "rolling"] }).notNull(),
  eligibilityNote: text("eligibility_note").notNull(),
  url: text("url").notNull(),
  requirements: text("requirements").array().notNull(),
  description: text("description").notNull(),
  verified: boolean("verified").notNull().default(false),
  verifiedOn: text("verified_on").notNull(),
  sourceNote: text("source_note").notNull(),
});

/** One profile per viewer (signed-in email, or an anonymous browser id). */
export const profiles = pgTable("profiles", {
  viewerId: text("viewer_id").primaryKey(),
  name: text("name").notNull().default(""),
  level: text("level", {
    enum: ["bachelors", "masters", "phd", "postdoc"],
  }).notNull(),
  field: text("field").notNull(),
  country: text("country").notNull(),
  targetCountries: text("target_countries").array().notNull().default(sql`'{}'`),
  graduationYear: integer("graduation_year"),
  notes: text("notes").notNull().default(""),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`now()`),
});

/** Scholarships a viewer is tracking, with their application status. */
export const tracked = pgTable("tracked", {
  id: text("id").primaryKey(),
  viewerId: text("viewer_id").notNull(),
  scholarshipSlug: text("scholarship_slug").notNull(),
  status: text("status", {
    enum: ["interested", "shortlisted", "applied", "submitted", "won", "rejected"],
  })
    .notNull()
    .default("interested"),
  note: text("note").notNull().default(""),
  createdAt: text("created_at")
    .notNull()
    .default(sql`now()`),
});
