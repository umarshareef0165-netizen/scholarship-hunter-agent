import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { resolveViewer } from "../server/lib/viewer.js";

const levelEnum = z.enum(["bachelors", "masters", "phd", "postdoc"]);

export default defineAction({
  description:
    "Save (or update) the student profile used for scholarship matching: level, field, home country, target destinations, graduation year.",
  schema: z.object({
    viewerId: z
      .string()
      .optional()
      .describe("Anonymous browser id (localStorage) when not signed in"),
    name: z.string().max(100).optional().describe("Student name (optional)"),
    level: levelEnum.describe("Degree level you are applying for"),
    field: z
      .string()
      .min(1)
      .describe(
        "Field key: 'cs', 'engineering', 'science', 'business', 'public-health', 'development', 'environment', 'economics', 'humanities', 'social-sciences', 'china-studies', or 'medicine'",
      ),
    country: z.string().min(1).describe("Home country, e.g. 'Pakistan'"),
    targetCountries: z
      .array(z.string())
      .optional()
      .describe("Destination countries, e.g. ['United Kingdom', 'Germany']"),
    graduationYear: z.coerce
      .number()
      .int()
      .min(2020)
      .max(2035)
      .optional()
      .describe("Expected graduation year"),
    notes: z.string().max(500).optional().describe("Free-form notes"),
  }),
  outputSchema: z.object({
    viewerId: z.string(),
    level: levelEnum,
    field: z.string(),
    country: z.string(),
    targetCountries: z.array(z.string()),
    message: z.string(),
  }),
  run: async (args, ctx) => {
    const viewer = resolveViewer(ctx, args.viewerId);
    const values = {
      viewerId: viewer,
      name: args.name ?? "",
      level: args.level,
      field: args.field,
      country: args.country,
      targetCountries: args.targetCountries ?? [],
      graduationYear: args.graduationYear ?? null,
      notes: args.notes ?? "",
      updatedAt: new Date().toISOString(),
    };
    await getDb()
      .insert(schema.profiles)
      .values(values)
      .onConflictDoUpdate({
        target: schema.profiles.viewerId,
        set: {
          name: values.name,
          level: values.level,
          field: values.field,
          country: values.country,
          targetCountries: values.targetCountries,
          graduationYear: values.graduationYear,
          notes: values.notes,
          updatedAt: values.updatedAt,
        },
      });
    return {
      viewerId: viewer,
      level: values.level,
      field: values.field,
      country: values.country,
      targetCountries: values.targetCountries,
      message: "Profile saved — matches are now ranked for you.",
    };
  },
});
