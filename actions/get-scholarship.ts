import { defineAction, fail } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { daysUntilDeadline, deadlineUrgency } from "../server/lib/matching.js";
import { ensureSeeded } from "../server/lib/seed.js";

export default defineAction({
  description:
    "Get the full detail of one scholarship programme by its slug, with days until deadline and urgency.",
  schema: z.object({
    slug: z.string().describe("Scholarship slug from list-scholarships"),
  }),
  http: { method: "GET" },
  readOnly: true,
  outputSchema: z.object({
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
  }),
  run: async ({ slug }) => {
    await ensureSeeded();
    const [row] = await getDb()
      .select()
      .from(schema.scholarships)
      .where(eq(schema.scholarships.slug, slug))
      .limit(1);
    if (!row)
      fail(`Scholarship "${slug}" not found.`, {
        errorCode: "not_found",
        statusCode: 404,
      });
    const now = new Date();
    return {
      ...row,
      daysUntil: daysUntilDeadline(row.deadline, now),
      urgency: deadlineUrgency(row, now),
    };
  },
});
