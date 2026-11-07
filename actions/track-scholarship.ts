import { defineAction, fail } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { ensureSeeded } from "../server/lib/seed.js";
import { resolveViewer } from "../server/lib/viewer.js";

const statusEnum = z.enum([
  "interested",
  "shortlisted",
  "applied",
  "submitted",
  "won",
  "rejected",
]);

export default defineAction({
  description:
    "Track a scholarship: add it to your list with a status (interested, shortlisted, applied, submitted, won, rejected). Calling it again updates the status.",
  schema: z.object({
    viewerId: z
      .string()
      .optional()
      .describe("Anonymous browser id (localStorage) when not signed in"),
    slug: z.string().describe("Scholarship slug from list-scholarships"),
    status: statusEnum
      .optional()
      .describe('Tracking status; defaults to "interested"'),
    note: z.string().max(300).optional().describe("Short note (optional)"),
  }),
  outputSchema: z.object({
    id: z.string(),
    slug: z.string(),
    status: statusEnum,
    message: z.string(),
  }),
  run: async (args, ctx) => {
    await ensureSeeded();
    const viewer = resolveViewer(ctx, args.viewerId);
    const [exists] = await getDb()
      .select({ slug: schema.scholarships.slug })
      .from(schema.scholarships)
      .where(eq(schema.scholarships.slug, args.slug))
      .limit(1);
    if (!exists)
      fail(`Scholarship "${args.slug}" not found.`, {
        errorCode: "not_found",
        statusCode: 404,
      });
    const status = args.status ?? "interested";
    const id = crypto.randomUUID();
    await getDb()
      .insert(schema.tracked)
      .values({
        id,
        viewerId: viewer,
        scholarshipSlug: args.slug,
        status,
        note: args.note ?? "",
      })
      .onConflictDoUpdate({
        target: [schema.tracked.viewerId, schema.tracked.scholarshipSlug],
        set: { status, note: args.note ?? "" },
      });
    // Return the stored row's id (an upsert keeps the earlier row's id).
    const [stored] = await getDb()
      .select({ id: schema.tracked.id })
      .from(schema.tracked)
      .where(
        and(
          eq(schema.tracked.viewerId, viewer),
          eq(schema.tracked.scholarshipSlug, args.slug),
        ),
      )
      .limit(1);
    return {
      id: stored?.id ?? id,
      slug: args.slug,
      status,
      message: `Tracking ${args.slug} as "${status}".`,
    };
  },
});
