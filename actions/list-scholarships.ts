import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { daysUntilDeadline, deadlineUrgency } from "../server/lib/matching.js";
import { ensureSeeded } from "../server/lib/seed.js";

const scholarshipOut = z.object({
  slug: z.string(),
  name: z.string(),
  provider: z.string(),
  country: z.string(),
  levels: z.array(z.string()),
  fields: z.array(z.string()),
  amount: z.string(),
  deadline: z.string().nullable(),
  deadlineNote: z.string(),
  status: z.enum(["open", "closed", "rolling"]),
  eligibilityNote: z.string(),
  url: z.string(),
  requirements: z.array(z.string()),
  description: z.string(),
  verified: z.boolean(),
  verifiedOn: z.string(),
  sourceNote: z.string(),
  daysUntil: z.number().nullable(),
  urgency: z.enum(["overdue", "urgent", "soon", "later", "none", "closed"]),
});

export default defineAction({
  description:
    "List real scholarship programmes, optionally filtered by level, field, status, or a search query. Returns each programme with days until its deadline and an urgency label.",
  schema: z.object({
    level: z
      .enum(["bachelors", "masters", "phd", "postdoc"])
      .optional()
      .describe("Degree level to filter by"),
    field: z.string().optional().describe("Field key, e.g. 'cs', 'engineering'"),
    status: z
      .enum(["open", "closed", "rolling"])
      .optional()
      .describe("Programme status to filter by"),
    query: z
      .string()
      .optional()
      .describe("Free-text search over name, provider, and country"),
  }),
  http: { method: "GET" },
  readOnly: true,
  outputSchema: z.object({
    scholarships: z.array(scholarshipOut),
    count: z.number(),
  }),
  run: async (args) => {
    await ensureSeeded();
    const rows = await getDb().select().from(schema.scholarships);
    const now = new Date();
    const q = args.query?.trim().toLowerCase();
    const filtered = rows.filter((r) => {
      if (args.level && !r.levels.includes(args.level)) return false;
      if (args.field && !r.fields.includes("all") && !r.fields.includes(args.field))
        return false;
      if (args.status && r.status !== args.status) return false;
      if (
        q &&
        !`${r.name} ${r.provider} ${r.country}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
    const scholarships = filtered
      .map((r) => ({
        ...r,
        daysUntil: daysUntilDeadline(r.deadline, now),
        urgency: deadlineUrgency(r, now),
      }))
      .sort((a, b) => {
        // Open first, then by nearest deadline; closed/rolling last.
        const rank = (s: (typeof filtered)[number]) =>
          s.status === "open" ? 0 : s.status === "rolling" ? 1 : 2;
        if (rank(a) !== rank(b)) return rank(a) - rank(b);
        if (a.daysUntil === null && b.daysUntil === null) return 0;
        if (a.daysUntil === null) return 1;
        if (b.daysUntil === null) return -1;
        return a.daysUntil - b.daysUntil;
      });
    return { scholarships, count: scholarships.length };
  },
});
