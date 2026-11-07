/**
 * Pure, deterministic Scholarship Hunter logic — no I/O, fully unit-tested.
 * The matching engine, deadline math, and the template essay outline all
 * live here so actions and the UI share one implementation.
 */

export interface ProfileInput {
  level: "bachelors" | "masters" | "phd" | "postdoc";
  field: string;
  country: string;
  targetCountries: string[];
  graduationYear?: number | null;
  name?: string;
}

export interface ScholarshipInput {
  slug: string;
  name: string;
  provider: string;
  country: string;
  levels: string[];
  fields: string[];
  amount: string;
  deadline: string | null;
  deadlineNote: string;
  status: "open" | "closed" | "rolling";
  verified: boolean;
}

export type Urgency =
  | "overdue"
  | "urgent" // <= 14 days
  | "soon" // <= 45 days
  | "later"
  | "none" // rolling / no fixed date
  | "closed";

/** Whole days from `now` until an ISO date (negative when past). */
export function daysUntilDeadline(
  deadline: string | null,
  now: Date = new Date(),
): number | null {
  if (!deadline) return null;
  const target = new Date(`${deadline}T23:59:59Z`);
  if (Number.isNaN(target.getTime())) return null;
  const startOfToday = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return Math.floor((target.getTime() - startOfToday) / 86_400_000);
}

export function deadlineUrgency(
  s: Pick<ScholarshipInput, "deadline" | "status">,
  now: Date = new Date(),
): Urgency {
  if (s.status === "closed") return "closed";
  if (s.status === "rolling" || !s.deadline) return "none";
  const days = daysUntilDeadline(s.deadline, now);
  if (days === null) return "none";
  if (days < 0) return "overdue";
  if (days <= 14) return "urgent";
  if (days <= 45) return "soon";
  return "later";
}

export interface MatchResult {
  score: number;
  reasons: string[];
}

/**
 * Deterministic match score, 0–100.
 * Level +40, field +30, destination +15, deadline timing +15.
 * Closed programmes are capped at 30 and flagged for next-cycle prep.
 */
export function scoreMatch(
  profile: ProfileInput,
  s: ScholarshipInput,
  now: Date = new Date(),
): MatchResult {
  const reasons: string[] = [];
  let score = 0;

  if (s.levels.includes(profile.level)) {
    score += 40;
    reasons.push(`Matches your ${profile.level} level`);
  } else {
    reasons.push(
      `Not for ${profile.level} level (offers ${s.levels.join(", ")})`,
    );
  }

  if (s.fields.includes("all") || s.fields.includes(profile.field)) {
    score += 30;
    reasons.push(
      s.fields.includes("all")
        ? "Open to all fields"
        : `Covers ${profile.field}`,
    );
  } else {
    reasons.push(`Field focus is ${s.fields.join(", ")}`);
  }

  const targets = profile.targetCountries ?? [];
  if (targets.length === 0 || targets.includes(s.country)) {
    score += 15;
    reasons.push(
      targets.length === 0
        ? "No destination filter — any country fits"
        : `In your target destinations (${s.country})`,
    );
  } else {
    reasons.push(`Destination ${s.country} is outside your targets`);
  }

  const urgency = deadlineUrgency(s, now);
  if (s.status === "closed") {
    score = Math.min(score, 30);
    reasons.push("Closed for this cycle — prepare for the next one");
  } else if (urgency === "urgent" || urgency === "soon") {
    score += 15;
    const days = daysUntilDeadline(s.deadline, now);
    reasons.push(
      `Deadline in ${days} day${days === 1 ? "" : "s"} — act now`,
    );
  } else if (urgency === "later") {
    score += 10;
    reasons.push("Deadline is further out — time to prepare");
  } else if (urgency === "none") {
    score += 10;
    reasons.push("Rolling / no fixed deadline");
  } else if (urgency === "overdue") {
    score = Math.min(score, 30);
    reasons.push("Deadline has passed — prepare for the next cycle");
  }

  return { score: Math.max(0, Math.min(100, score)), reasons };
}

export interface EssayOutline {
  title: string;
  hook: string;
  points: { heading: string; detail: string }[];
  closing: string;
  wordTarget: string;
}

/**
 * Deterministic template outline for a scholarship essay / statement.
 * This is a structure built from the profile + programme facts — not
 * AI-written prose. The agent chat (Gemini) turns it into a personalised
 * draft; the outline itself always works, even with no LLM key set.
 */
export function buildEssayOutline(
  profile: ProfileInput,
  s: ScholarshipInput,
): EssayOutline {
  const name = profile.name?.trim() ? profile.name.trim() : "the applicant";
  const levelLabel =
    profile.level === "bachelors"
      ? "Bachelor's"
      : profile.level === "masters"
        ? "Master's"
        : profile.level === "phd"
          ? "PhD"
          : "Postdoctoral";
  return {
    title: `${s.name} — application essay outline`,
    hook: `Open with the moment you chose ${profile.field}: one concrete scene (a project, a class, a problem you solved) that shows why this field, not a generic claim. Write it in your own voice — the panel reads hundreds of these.`,
    points: [
      {
        heading: "Why this programme, specifically",
        detail: `${s.name} (${s.provider}, ${s.country}) funds ${s.amount.toLowerCase()}. Name one real feature of the programme — a course, a lab, a research group — and tie it to work you have already done.`,
      },
      {
        heading: "What you bring",
        detail: `${name} is a ${levelLabel} applicant in ${profile.field} from ${profile.country}. Pick two proofs: your strongest project and one result with a number (users, accuracy, award, publication). Evidence beats adjectives.`,
      },
      {
        heading: "What you will do with it",
        detail: `Say what changes after the degree: the problem back home you will work on, and the first concrete step you will take in year one. Panels fund future impact, not past grades alone.`,
      },
      {
        heading: "Fit and need",
        detail: `Explain briefly why this scholarship — not a loan, not another university — is the route that makes the plan possible. One honest paragraph is enough.`,
      },
    ],
    closing:
      "Close by returning to the opening scene: what the same moment looks like after the degree. Keep the whole statement tight and specific — cut every sentence that could belong to any applicant.",
    wordTarget: "Aim for 500–750 words total (roughly 120–150 per section).",
  };
}

/** Generic preparation steps, combined with the programme requirements. */
export function prepSteps(s: ScholarshipInput): string[] {
  const steps: string[] = [
    "Read the official programme page end to end — rules change yearly.",
    "Check the deadline in your own timezone; submit at least 48 hours early.",
  ];
  if (s.deadline) {
    steps.push(`Deadline: ${s.deadline}. ${s.deadlineNote}`);
  } else {
    steps.push(s.deadlineNote);
  }
  if (!s.verified) {
    steps.push(
      "This entry is UNVERIFIED — confirm the deadline and requirements on the official page before you apply.",
    );
  }
  steps.push(
    "Line up referees early and give them your CV + the programme's criteria.",
    "Draft the statement from the outline, then ask the agent to review it.",
  );
  return steps;
}
