import { useMemo } from "react";
import { Link, useParams } from "react-router";

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
import { Skeleton } from "@/components/ui/skeleton";
import { getViewerId } from "@/lib/viewer-id";

export function meta() {
  return [{ title: "Scholarship — Scholarship Hunter" }];
}

function urgencyBadge(urgency: string, daysUntil: number | null): string {
  if (urgency === "closed") return "Closed for this cycle";
  if (urgency === "overdue") return "Deadline passed";
  if (daysUntil === null) return "Rolling — apply any time";
  if (daysUntil === 0) return "Closes today";
  if (daysUntil === 1) return "Closes tomorrow";
  return `${daysUntil} days left`;
}

export default function ScholarshipDetail() {
  const { slug } = useParams();
  const viewerId = useMemo(() => getViewerId(), []);

  const detailQuery = useActionQuery("get-scholarship", {
    slug: slug ?? "",
  });
  const checklistQuery = useActionQuery("get-application-checklist", {
    viewerId,
    slug: slug ?? "",
  });
  const trackedQuery = useActionQuery("list-tracked", { viewerId });
  const trackMutation = useActionMutation("track-scholarship");

  const s = detailQuery.data ?? null;
  const checklist = checklistQuery.data ?? null;
  const isTracked = useMemo(
    () => (trackedQuery.data?.tracked ?? []).some((t) => t.slug === slug),
    [trackedQuery.data, slug],
  );

  function askAgentToDraft() {
    if (!s) return;
    sendToAgentChat({
      message: `Draft my application for ${s.name} (${s.slug}). Use get-application-checklist for ${s.slug} to get the requirements and essay outline, then write a full first draft of the personal statement in my voice, plus a week-by-week plan to the deadline.`,
      context: `Scholarship Hunter: drafting for ${s.name} (${s.slug}). Deadline: ${s.deadlineNote}`,
      submit: true,
      openSidebar: true,
    });
  }

  if (detailQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (detailQuery.isError || !s) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6">
        <h1 className="text-2xl font-bold">Scholarship not found</h1>
        <p className="text-sm text-muted-foreground">
          This programme may have been removed, or the link is wrong.
        </p>
        <Button variant="outline" asChild>
          <Link to="/scholarships">← Back to all scholarships</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6">
      <div>
        <Link
          to="/scholarships"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← All scholarships
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{s.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {s.provider} · {s.country} · {s.amount}
        </p>
        <p className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
            {urgencyBadge(s.urgency, s.daysUntil)}
          </span>
          {s.verified ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
              ✓ Verified 7 Nov 2026
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              ⚠ Unverified — confirm the deadline on the official site
            </span>
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About this programme</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p>{s.description}</p>
          <p>
            <strong>Deadline:</strong> {s.deadlineNote}
          </p>
          <p>
            <strong>Levels:</strong> {s.levels.join(", ")}
          </p>
          <p>
            <strong>Fields:</strong> {s.fields.join(", ")}
          </p>
          <p>
            <strong>Official site:</strong>{" "}
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              {s.url}
            </a>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              disabled={isTracked || trackMutation.isPending}
              onClick={() =>
                trackMutation.mutate({
                  viewerId,
                  slug: s.slug,
                  status: "shortlisted",
                })
              }
            >
              {isTracked ? "✓ Tracked" : "Track this scholarship"}
            </Button>
            <Button variant="secondary" onClick={askAgentToDraft}>
              🤖 Ask the agent to draft my application
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📋 Application checklist</CardTitle>
          <CardDescription>
            Requirements, preparation steps, and a personalised essay outline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {checklistQuery.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : checklist?.needsProfile ? (
            <div className="flex flex-col gap-2 text-sm">
              <p className="text-muted-foreground">
                Save your profile on the home page to get a personalised essay
                outline for this scholarship.
              </p>
              <Button variant="outline" asChild className="w-fit">
                <Link to="/home">Go to your profile →</Link>
              </Button>
            </div>
          ) : checklist ? (
            <div className="flex flex-col gap-5 text-sm">
              <div>
                <h3 className="font-semibold">Requirements</h3>
                <ul className="mt-1 list-disc pl-5">
                  {checklist.requirements.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Preparation steps</h3>
                <ol className="mt-1 list-decimal pl-5">
                  {checklist.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
              {checklist.outline && (
                <div>
                  <h3 className="font-semibold">
                    Essay outline — {checklist.outline.title}
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    Hook: {checklist.outline.hook}
                  </p>
                  <ol className="mt-2 list-decimal pl-5">
                    {checklist.outline.points.map((point) => (
                      <li key={point.heading}>
                        <strong>{point.heading}.</strong> {point.detail}
                      </li>
                    ))}
                  </ol>
                  <p className="mt-2 text-muted-foreground">
                    Closing: {checklist.outline.closing}
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    Target: {checklist.outline.wordTarget}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This is a structure template, not AI prose — ask the agent
                    to draft the full essay from it.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Checklist could not be loaded.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
