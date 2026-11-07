import { defineAction } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { resolveViewer } from "../server/lib/viewer.js";

export default defineAction({
  description: "Read the saved student profile (level, field, country, destinations). Returns null when no profile is saved yet.",
  schema: z.object({
    viewerId: z
      .string()
      .optional()
      .describe("Anonymous browser id (localStorage) when not signed in"),
  }),
  http: { method: "GET" },
  readOnly: true,
  outputSchema: z.object({
    profile: z
      .object({
        viewerId: z.string(),
        name: z.string(),
        level: z.enum(["bachelors", "masters", "phd", "postdoc"]),
        field: z.string(),
        country: z.string(),
        targetCountries: z.array(z.string()),
        graduationYear: z.number().nullable(),
        notes: z.string(),
      })
      .nullable(),
  }),
  run: async (args, ctx) => {
    const viewer = resolveViewer(ctx, args.viewerId);
    const [row] = await getDb()
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.viewerId, viewer))
      .limit(1);
    return { profile: row ?? null };
  },
});
