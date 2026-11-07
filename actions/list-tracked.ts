import { defineAction } from "@agent-native/core/action";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { daysUntilDeadline, deadlineUrgency } from "../server/lib/matching.js";
import { ensureSeeded } from "../server/lib/seed.js";
import { resolveViewer } from "../server/lib/viewer.js";

export default defineAction({
  description:
    "List the scholarships you are tracking, with their deadlines, days remaining, urgency, and your status for each — nearest deadline first.",
  schema: z.object({
    viewerId: z
      .string()
      .optional()
      .describe("Anonymous browser id (localStorage) when not signed in"),
  }),
  http: { method: "GET" },
  readOnly: true,
  outputSchema: z.object({
    tracked: z.array(
      z.object({
        id: z.string(),
        slug: z.string(),
        name: z.string(),
        provider: z.string(),
        country: z.string(),
        amount: z.string(),
        deadline: z.string().nullable(),
        deadlineNote: z.string(),
        status: z.enum(["open", "closed", "rolling"]),
        verified: z.boolean(),
        url: z.string(),
        trackingStatus: z.enum([
          "interested",
          "shortlisted",
          "applied",
          "submitted",
          "won",
          "rejected",
        ]),
        note: z.string(),
        daysUntil: z.number().nullable(),
        urgency: z.enum([
          "overdue",
          "urgent",
          "soon",
          "later",
          "none",
          "closed",
        ]),
      }),
    ),
    count: z.number(),
  }),
  run: async (args, ctx) => {
    await ensureSeeded();
    const viewer = resolveViewer(ctx, args.viewerId);
    const rows = await getDb()
      .select()
      .from(schema.tracked)
      .where(eq(schema.tracked.viewerId, viewer));
    if (rows.length === 0) return { tracked: [], count: 0 };
    const slugs = rows.map((r) => r.scholarshipSlug);
    const ships = await getDb()
      .select()
      .from(schema.scholarships)
      .where(inArray(schema.scholarships.slug, slugs));
    const bySlug = new Map(ships.map((s) => [s.slug, s]));
    const now = new Date();
    const tracked = rows
      .map((r) => {
        const s = bySlug.get(r.scholarshipSlug);
        if (!s) return null;
        return {
          id: r.id,
          slug: s.slug,
          name: s.name,
          provider: s.provider,
          country: s.country,
          amount: s.amount,
          deadline: s.deadline,
          deadlineNote: s.deadlineNote,
          status: s.status,
          verified: s.verified,
          url: s.url,
          trackingStatus: r.status,
          note: r.note,
          daysUntil: daysUntilDeadline(s.deadline, now),
          urgency: deadlineUrgency(s, now),
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => {
        if (a.daysUntil === null && b.daysUntil === null) return 0;
        if (a.daysUntil === null) return 1;
        if (b.daysUntil === null) return -1;
        return a.daysUntil - b.daysUntil;
      });
    return { tracked, count: tracked.length };
  },
});
