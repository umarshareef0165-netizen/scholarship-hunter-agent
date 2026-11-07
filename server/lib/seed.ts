import { SCHOLARSHIP_SEEDS } from "../db/seed-scholarships.js";
import { getDb, schema } from "../db/index.js";

/**
 * Idempotent seed: inserts the verified scholarship dataset only when the
 * table is empty. Safe to call on every read action — it is a no-op once
 * seeded, and never overwrites rows (edits stay manual).
 */
export async function ensureSeeded(): Promise<{ seeded: boolean }> {
  const db = getDb();
  const existing = await db
    .select({ slug: schema.scholarships.slug })
    .from(schema.scholarships)
    .limit(1);
  if (existing.length > 0) return { seeded: false };
  await db.insert(schema.scholarships).values(
    SCHOLARSHIP_SEEDS.map((s) => ({
      slug: s.slug,
      name: s.name,
      provider: s.provider,
      country: s.country,
      levels: s.levels,
      fields: s.fields,
      amount: s.amount,
      deadline: s.deadline,
      deadlineNote: s.deadlineNote,
      status: s.status,
      eligibilityNote: s.eligibilityNote,
      url: s.url,
      requirements: s.requirements,
      description: s.description,
      verified: s.verified,
      verifiedOn: s.verifiedOn,
      sourceNote: s.sourceNote,
    })),
  );
  return { seeded: true };
}
