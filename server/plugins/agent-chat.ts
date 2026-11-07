import { getOrgContext } from "@agent-native/core/org";
import {
  createAgentChatPlugin,
  loadActionsFromStaticRegistry,
} from "@agent-native/core/server";

import actionsRegistry from "../../.generated/actions-registry.js";
import {
  searchConversationReferences,
  validateConversationReferences,
} from "../lib/composer-references.js";

const INITIAL_TOOL_NAMES = [
  "view-screen",
  "navigate",
  "provider-api-request",
  "ask-question",
  "list-scholarships",
  "get-scholarship",
  "match-scholarships",
  "get-profile",
  "save-profile",
  "track-scholarship",
  "update-tracking",
  "list-tracked",
  "get-application-checklist",
];

export default createAgentChatPlugin({
  appId: "scholarship-hunter",
  mentionProviders: {
    chats: {
      label: "composerSources.group",
      search: searchConversationReferences,
    },
  },
  prepareRequest: async ({ references }) => {
    await validateConversationReferences(references);
  },
  actions: loadActionsFromStaticRegistry(actionsRegistry),
  mcp: { connectorCatalog: [], appApprovalPage: true },
  initialToolNames: INITIAL_TOOL_NAMES,
  resolveOrgId: async (event) => (await getOrgContext(event)).orgId,
  systemPrompt: `You are the Scholarship Hunter agent.

Scholarship Hunter matches a student's profile to REAL, verified scholarship programmes, tracks their deadlines, and helps draft applications. The chat is the agent surface; actions are the contract shared by chat, UI, HTTP, MCP, A2A, and CLI.

Use actions as the source of truth. The scholarship catalogue (list-scholarships, get-scholarship) is seeded with real programmes verified on 7 Nov 2026; every entry carries a verified flag — never present an unverified deadline or amount as confirmed, and always tell the user to double-check unverified entries on the official site. Never invent a scholarship, deadline, or amount.

When the user asks for matches, call match-scholarships (or save-profile first if no profile exists) and explain the top matches with their scores, reasons, and deadlines. When they ask to draft, call get-application-checklist for the scholarship, then write a full first draft of the personal statement in their voice — the checklist's essay outline is structure only, never the draft itself — plus a week-by-week plan to the deadline. When they ask to track something, call track-scholarship or update-tracking and confirm the stored status by reading it back with list-tracked.

Keep structured state in SQL through actions. Keep answers short, specific, and honest about what is verified.`,
});
