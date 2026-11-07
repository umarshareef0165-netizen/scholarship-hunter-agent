import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import { sendToAgentChat } from "@agent-native/core/client/agent-chat";
import {
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client/hooks";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getViewerId } from "@/lib/viewer-id";

const LEVELS = [
  { value: "bachelors", label: "Bachelor's" },
  { value: "masters", label: "Master's" },
  { value: "phd", label: "PhD" },
  { value: "postdoc", label: "Postdoc" },
] as const;

const FIELDS = [
  { value: "cs", label: "Computer Science / AI" },
  { value: "engineering", label: "Engineering" },
  { value: "science", label: "Natural Sciences" },
  { value: "medicine", label: "Medicine / Health" },
  { value: "business", label: "Business" },
  { value: "economics", label: "Economics" },
  { value: "social-sciences", label: "Social Sciences" },
  { value: "humanities", label: "Arts & Humanities" },
  { value: "development", label: "Development Studies" },
  { value: "environment", label: "Environment / Sustainability" },
  { value: "public-health", label: "Public Health" },
  { value: "china-studies", label: "China Studies" },
] as const;

const DESTINATIONS = [
  "United Kingdom",
  "Germany",
  "USA",
  "Canada",
  "Türkiye",
  "Japan",
  "Netherlands",
  "France",
  "Sweden",
  "Switzerland",
  "China",
  "Saudi Arabia",
  "Australia",
  "South Korea",
  "Hungary",
  "Russia",
] as const;

const TRACK_STATUSES = [
  { value: "interested", label: "Interested" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "applied", label: "Applied" },
  { value: "submitted", label: "Submitted" },
  { value: "won", label: "Won 🎉" },
  { value: "rejected", label: "Rejected" },
] as const;

function urgencyBadge(urgency: string, daysUntil: number | null): string {
  if (urgency === "closed") return "Closed";
  if (urgency === "overdue") return "Deadline passed";
  if (daysUntil === null) return "Rolling";
  if (daysUntil === 0) return "Closes today";
  if (daysUntil === 1) return "Closes tomorrow";
  return `${daysUntil} days left`;
}

function urgencyClass(urgency: string): string {
  switch (urgency) {
    case "urgent":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200";
    case "soon":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
    case "closed":
    case "overdue":
      return "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
    default:
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
  }
}

function scoreBar(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 55) return "bg-amber-500";
  return "bg-zinc-400";
}

export default function HunterHome() {
  const viewerId = useMemo(() => getViewerId(), []);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const profileQuery = useActionQuery("get-profile", { viewerId });
  const profile = profileQuery.data?.profile ?? null;

  const [name, setName] = useState("");
  const [level, setLevel] = useState("masters");
  const [field, setField] = useState("cs");
  const [country, setCountry] = useState("Pakistan");
  const [targets, setTargets] = useState<string[]>([
    "United Kingdom",
    "Germany",
  ]);
  const [graduationYear, setGraduationYear] = useState("2027");
  const [notes, setNotes] = useState("");

  // Seed the form from the saved profile once it loads.
  const [formSeeded, setFormSeeded] = useState(false);
  useEffect(() => {
    if (profile && !formSeeded) {
      setName(profile.name ?? "");
      setLevel(profile.level);
      setField(profile.field);
      setCountry(profile.country);
      setTargets(profile.targetCountries ?? []);
      setGraduationYear(String(profile.graduationYear ?? 2027));
      setNotes(profile.notes ?? "");
      setFormSeeded(true);
    }
  }, [profile, formSeeded]);

  const matchesQuery = useActionQuery(
    "match-scholarships",
    { viewerId },
    { enabled: profile !== null },
  );
  const openQuery = useActionQuery("list-scholarships", {
    status: "open",
  });
  const trackedQuery = useActionQuery("list-tracked", { viewerId });

  const saveProfile = useActionMutation("save-profile", {
    onSuccess: () => setSavedNote("Profile saved — matches updated."),
  });
  const trackMutation = useActionMutation("track-scholarship");
  const updateTracking = useActionMutation("update-tracking");

  const matches = matchesQuery.data?.matches ?? [];
  const openScholarships = openQuery.data?.scholarships ?? [];
  const closingSoon = useMemo(
    () =>
      openScholarships.filter(
        (s) => s.urgency === "urgent" || s.urgency === "soon",
      ),
    [openScholarships],
  );
  const tracked = trackedQuery.data?.tracked ?? [];
  const trackedSlugs = useMemo(
    () => new Set(tracked.map((t) => t.slug)),
    [tracked],
  );

  function toggleTarget(countryName: string) {
    setTargets((prev) =>
      prev.includes(countryName)
        ? prev.filter((c) => c !== countryName)
        : [...prev, countryName],
    );
  }

  function saveProfileForm(event: React.FormEvent) {
    event.preventDefault();
    setSavedNote(null);
    saveProfile.mutate({
      viewerId,
      name: name.trim() || undefined,
      level: level as "bachelors" | "masters" | "phd" | "postdoc",
      field,
      country: country.trim() || "Pakistan",
      targetCountries: targets,
      graduationYear: Number.parseInt(graduationYear, 10) || undefined,
      notes: notes.trim() || undefined,
    });
  }

  function askAgentToMatch() {
    sendToAgentChat({
      message: `Find my best scholarship matches. I am ${name || "a student"} from ${country}, studying ${field} at ${level} level, graduating ${graduationYear}. My target countries are ${targets.join(", ") || "any"}. Use the match-scholarships and list-scholarships tools, explain the top 3 matches with their deadlines, and track the best one for me.`,
      context: `Scholarship Hunter profile: level=${level}, field=${field}, country=${country}, targets=${targets.join(", ")}, graduation=${graduationYear}.`,
      submit: true,
      openSidebar: true,
    });
  }

  function askAgentToDraft(slug: string, scholarshipName: string) {
    sendToAgentChat({
      message: `Draft my application for ${scholarshipName}. Use get-application-checklist for ${slug} to get the requirements and essay outline, then write a full first draft of the personal statement in my voice, plus a week-by-week plan to the deadline.`,
      context: `Scholarship Hunter: drafting for ${scholarshipName} (${slug}).`,
      submit: true,
      openSidebar: true,
    });
  }

  const profileLoading = profileQuery.isLoading;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            🎓 Scholarship Hunter
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            An agent that matches your profile to real scholarships, tracks
            their deadlines, and drafts your applications. 17 real programmes,
            verified 7 Nov 2026 — unverified entries are labelled, never
            hidden.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={askAgentToMatch}
          disabled={profile === null}
          title={
            profile === null
              ? "Save your profile first"
              : "Ask the agent to find matches"
          }
        >
          🤖 Ask the agent to find matches
        </Button>
      </header>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
          <CardDescription>
            The matching engine scores every scholarship against this. Saved
            in your browser — no account needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-1/2" />
            </div>
          ) : (
            <form onSubmit={saveProfileForm} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="hunter-name">Name</Label>
                  <Input
                    id="hunter-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="hunter-country">Home country</Label>
                  <Input
                    id="hunter-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Pakistan"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="hunter-level">Study level</Label>
                  <select
                    id="hunter-level"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  >
                    {LEVELS.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="hunter-field">Field of study</Label>
                  <select
                    id="hunter-field"
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  >
                    {FIELDS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="hunter-year">Graduation year</Label>
                  <Input
                    id="hunter-year"
                    inputMode="numeric"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="2027"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="hunter-notes">Notes (optional)</Label>
                  <Input
                    id="hunter-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. strong in AI agents, need full funding"
                  />
                </div>
              </div>
              <div>
                <Label>Target countries</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DESTINATIONS.map((dest) => {
                    const active = targets.includes(dest);
                    return (
                      <button
                        key={dest}
                        type="button"
                        onClick={() => toggleTarget(dest)}
                        className={
                          active
                            ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                            : "rounded-full border px-3 py-1 text-xs font-medium hover:bg-accent"
                        }
                      >
                        {dest}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saveProfile.isPending}>
                  {saveProfile.isPending ? "Saving…" : "Save profile"}
                </Button>
                {savedNote && (
                  <span className="text-sm text-emerald-600">{savedNote}</span>
                )}
                {saveProfile.isError && (
                  <span className="text-sm text-red-600">
                    Could not save — please try again.
                  </span>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Closing soon */}
      <Card>
        <CardHeader>
          <CardTitle>⏰ Closing soon</CardTitle>
          <CardDescription>
            Open scholarships with deadlines in the next 45 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {openQuery.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : closingSoon.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing closes in the next 45 days.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {closingSoon.map((s) => (
                <li
                  key={s.slug}
                  className="flex flex-wrap items-center justify-between gap-2 py-2"
                >
                  <Link
                    to={`/scholarships/${s.slug}`}
                    className="font-medium hover:underline"
                  >
                    {s.name}
                  </Link>
                  <span className="flex items-center gap-2">
                    {!s.verified && (
                      <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-800">
                        Unverified
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${urgencyClass(s.urgency)}`}
                    >
                      {urgencyBadge(s.urgency, s.daysUntil)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Top matches */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Top matches for you</CardTitle>
          <CardDescription>
            Scored 0–100 on level, field, destination and timing. Closed
            programmes are capped at 30 so they never outrank open ones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profile === null && !profileLoading ? (
            <p className="text-sm text-muted-foreground">
              Save your profile above to see your ranked matches.
            </p>
          ) : matchesQuery.isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : matches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No matches yet — try widening your target countries.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {matches.slice(0, 5).map((m) => (
                <li key={m.slug} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      to={`/scholarships/${m.slug}`}
                      className="font-medium hover:underline"
                    >
                      {m.name}
                    </Link>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${urgencyClass(m.urgency)}`}
                    >
                      {urgencyBadge(m.urgency, m.daysUntil)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className={`h-full ${scoreBar(m.score)}`}
                        style={{ width: `${m.score}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold">{m.score}/100</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {m.reasons.join(" · ")}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={trackedSlugs.has(m.slug)}
                      onClick={() =>
                        trackMutation.mutate({
                          viewerId,
                          slug: m.slug,
                          status: "shortlisted",
                        })
                      }
                    >
                      {trackedSlugs.has(m.slug) ? "✓ Tracked" : "Track this"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => askAgentToDraft(m.slug, m.name)}
                    >
                      🤖 Draft my application
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Tracked */}
      <Card>
        <CardHeader>
          <CardTitle>📌 Your tracked applications</CardTitle>
          <CardDescription>
            Nearest deadline first. Change the status as you apply.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trackedQuery.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : tracked.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing tracked yet — hit “Track this” on a match or a
              scholarship page.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {tracked.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2"
                >
                  <div>
                    <Link
                      to={`/scholarships/${t.slug}`}
                      className="font-medium hover:underline"
                    >
                      {t.name}
                    </Link>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {t.deadlineNote}
                    </span>
                  </div>
                  <span className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${urgencyClass(t.urgency)}`}
                    >
                      {urgencyBadge(t.urgency, t.daysUntil)}
                    </span>
                    <select
                      value={t.trackingStatus}
                      onChange={(e) =>
                        updateTracking.mutate({
                          viewerId,
                          id: t.id,
                          status: e.target.value as
                            | "interested"
                            | "shortlisted"
                            | "applied"
                            | "submitted"
                            | "won"
                            | "rejected"
                            | "removed",
                        })
                      }
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      aria-label={`Status for ${t.name}`}
                    >
                      {TRACK_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        updateTracking.mutate({
                          viewerId,
                          id: t.id,
                          status: "removed",
                        })
                      }
                    >
                      Remove
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* All scholarships */}
      <Card>
        <CardHeader>
          <CardTitle>📚 All scholarships</CardTitle>
          <CardDescription>
            <Link to="/scholarships" className="underline">
              Browse all {openScholarships.length} open programmes
            </Link>{" "}
            with filters, or search the full catalogue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link to="/scholarships">Browse all scholarships →</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
