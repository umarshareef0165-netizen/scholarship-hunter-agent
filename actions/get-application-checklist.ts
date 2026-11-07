import { defineAction, fail } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import {
  buildEssayOutline,
  daysUntilDeadline,
  deadlineUrgency,
  prepSteps,
} from "../server/lib/matching.js";
import { ensureSeeded } from "../server/lib/seed.js";
import { resolveViewer } from "../server/lib/viewer.js";

export default defineAction({
  description:
    "Get the application checklist for one scholarship: its requirements, preparation steps, deadline info, and — when a profile is saved — a personalised template essay outline (structure only, not AI prose; ask the agent to draft the full text).",
  schema: z.object({
    viewerId: z
      .string()
      .optional()
      .describe("Anonymous browser id (localStorage) when not signed in"),
    slug: z.string().describe("Scholarship slug from list-scholarships"),
  }),
  http: { method: "GET" },
  readOnly: true,
  outputSchema: z.object({
    slug: z.string(),
    name: z.string(),
    deadline: z.string().nullable(),
    deadlineNote: z.string(),
    status: z.enum(["open", "closed", "rolling"]),
    verified: z.boolean(),
    daysUntil: z.number().nullable(),
    urgency: z.enum(["overdue", "urgent", "soon", "later", "none", "closed"]),
    requirements: z.array(z.string()),
    steps: z.array(z.string()),
    outline: z
      .object({
        title: z.string(),
        hook: z.string(),
        points: z.array(
          z.object({ heading: z.string(), detail: z.string() }),
        ),
        closing: z.string(),
        wordTarget: z.string(),
      })
      .nullable(),
    needsProfile: z.boolean(),
  }),
  run: async (args, ctx) => {
    await ensureSeeded();
    const [row] = await getDb()
      .select()
      .from(schema.scholarships)
      .where(eq(schema.scholarships.slug, args.slug))
      .limit(1);
    if (!row)
      fail(`Scholarship "${args.slug}" not found.`, {
        errorCode: "not_found",
        statusCode: 404,
      });
    const viewer = resolveViewer(ctx, args.viewerId);
    const [profile] = await getDb()
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.viewerId, viewer))
      .limit(1);
    const now = new Date();
    const outline = profile
      ? buildEssayOutline(
          {
            level: profile.level,
            field: profile.field,
            country: profile.country,
            targetCountries: profile.targetCountries ?? [],
            graduationYear: profile.graduationYear,
            name: profile.name,
          },
          row,
        )
      : null;
    return {
      slug: row.slug,
      name: row.name,
      deadline: row.deadline,
      deadlineNote: row.deadlineNote,
      status: row.status,
      verified: row.verified,
      daysUntil: daysUntilDeadline(row.deadline, now),
      urgency: deadlineUrgency(row, now),
      requirements: row.requirements,
      steps: prepSteps(row),
      outline,
      needsProfile: !profile,
    };
  },
});
