import { defineAction, fail } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { resolveViewer } from "../server/lib/viewer.js";

const statusEnum = z.enum([
  "interested",
  "shortlisted",
  "applied",
  "submitted",
  "won",
  "rejected",
  "removed",
]);

export default defineAction({
  description:
    "Change the status of a tracked scholarship (interested, shortlisted, applied, submitted, won, rejected). Use 'removed' to stop tracking it.",
  schema: z.object({
    viewerId: z
      .string()
      .optional()
      .describe("Anonymous browser id (localStorage) when not signed in"),
    id: z.string().describe("Tracked-row id from list-tracked"),
    status: statusEnum.describe("New status; 'removed' deletes the row"),
    note: z.string().max(300).optional().describe("Replace the note"),
  }),
  outputSchema: z.object({
    id: z.string(),
    status: statusEnum,
    message: z.string(),
  }),
  run: async (args, ctx) => {
    const viewer = resolveViewer(ctx, args.viewerId);
    const where = and(
      eq(schema.tracked.id, args.id),
      eq(schema.tracked.viewerId, viewer),
    );
    if (args.status === "removed") {
      const deleted = await getDb()
        .delete(schema.tracked)
        .where(where)
        .returning({ id: schema.tracked.id });
      if (deleted.length === 0)
        fail("Tracked entry not found.", {
          errorCode: "not_found",
          statusCode: 404,
        });
      return { id: args.id, status: "removed" as const, message: "Removed from your list." };
    }
    const updated = await getDb()
      .update(schema.tracked)
      .set({
        status: args.status,
        ...(args.note !== undefined ? { note: args.note } : {}),
      })
      .where(where)
      .returning({ id: schema.tracked.id });
    if (updated.length === 0)
      fail("Tracked entry not found.", {
        errorCode: "not_found",
        statusCode: 404,
      });
    return {
      id: args.id,
      status: args.status,
      message: `Status updated to "${args.status}".`,
    };
  },
});
