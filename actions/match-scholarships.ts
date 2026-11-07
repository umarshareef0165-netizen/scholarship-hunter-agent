import { defineAction, fail } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import {
  daysUntilDeadline,
  deadlineUrgency,
  scoreMatch,
} from "../server/lib/matching.js";
import { ensureSeeded } from "../server/lib/seed.js";
import { resolveViewer } from "../server/lib/viewer.js";

const levelEnum = z.enum(["bachelors", "masters", "phd", "postdoc"]);

export default defineAction({
  description:
    "Rank all scholarship programmes against a student profile, best match first. Uses the saved profile when one exists, or the level/field/country given here. Each match carries a 0–100 score and plain-language reasons.",
  schema: z.object({
    viewerId: z
      .string()
      .optional()
      .describe("Anonymous browser id (localStorage) when not signed in"),
    level: levelEnum
      .optional()
      .describe("Degree level, e.g. 'masters'; defaults to the saved profile"),
    field: z
      .string()
      .optional()
      .describe("Field key, e.g. 'cs'; defaults to the saved profile"),
    country: z
      .string()
      .optional()
      .describe("Home country; defaults to the saved profile"),
    targetCountries: z
      .array(z.string())
      .optional()
      .describe("Destination countries, e.g. ['United Kingdom', 'Germany']"),
  }),
  http: { method: "GET" },
  readOnly: true,
  outputSchema: z.object({
    profileUsed: z.object({
      level: levelEnum,
      field: z.string(),
      country: z.string(),
      targetCountries: z.array(z.string()),
    }),
    matches: z.array(
      z.object({
        slug: z.string(),
        name: z.string(),
        provider: z.string(),
        country: z.string(),
        levels: z.array(z.string()),
        amount: z.string(),
        deadline: z.string().nullable(),
        deadlineNote: z.string(),
        status: z.enum(["open", "closed", "rolling"]),
        verified: z.boolean(),
        url: z.string(),
        score: z.number(),
        reasons: z.array(z.string()),
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
  }),
  run: async (args, ctx) => {
    await ensureSeeded();
    const viewer = resolveViewer(ctx, args.viewerId);
    let profile: {
      level: "bachelors" | "masters" | "phd" | "postdoc";
      field: string;
      country: string;
      targetCountries: string[];
    } | null = null;

    if (args.level && args.field && args.country) {
      profile = {
        level: args.level,
        field: args.field,
        country: args.country,
        targetCountries: args.targetCountries ?? [],
      };
    } else {
      const [saved] = await getDb()
        .select()
        .from(schema.profiles)
        .where(eq(schema.profiles.viewerId, viewer))
        .limit(1);
      if (saved) {
        profile = {
          level: saved.level,
          field: saved.field,
          country: saved.country,
          targetCountries: saved.targetCountries ?? [],
        };
      }
    }

    if (!profile) {
      fail(
        "No profile yet — save your profile first (level, field, country), or pass level, field, and country here.",
        { errorCode: "profile_required", statusCode: 400 },
      );
    }

    const rows = await getDb().select().from(schema.scholarships);
    const now = new Date();
    const matches = rows
      .map((r) => {
        const { score, reasons } = scoreMatch(profile, r, now);
        return {
          slug: r.slug,
          name: r.name,
          provider: r.provider,
          country: r.country,
          levels: r.levels,
          amount: r.amount,
          deadline: r.deadline,
          deadlineNote: r.deadlineNote,
          status: r.status,
          verified: r.verified,
          url: r.url,
          score,
          reasons,
          daysUntil: daysUntilDeadline(r.deadline, now),
          urgency: deadlineUrgency(r, now),
        };
      })
      .sort((a, b) => b.score - a.score || (a.daysUntil ?? 9999) - (b.daysUntil ?? 9999));
    return { profileUsed: profile, matches };
  },
});
