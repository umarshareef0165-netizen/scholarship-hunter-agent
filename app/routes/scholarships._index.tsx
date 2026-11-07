import { useMemo, useState } from "react";
import { Link } from "react-router";

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

export function meta() {
  return [{ title: "Browse scholarships — Scholarship Hunter" }];
}

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

export default function ScholarshipsBrowse() {
  const viewerId = useMemo(() => getViewerId(), []);
  const [level, setLevel] = useState("all");
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");

  const listQuery = useActionQuery("list-scholarships", {
    level:
      level === "all"
        ? undefined
        : (level as "bachelors" | "masters" | "phd" | "postdoc"),
    status:
      status === "all"
        ? undefined
        : (status as "open" | "closed" | "rolling"),
    query: query.trim() || undefined,
  });
  const trackedQuery = useActionQuery("list-tracked", { viewerId });
  const trackMutation = useActionMutation("track-scholarship");

  const scholarships = listQuery.data?.scholarships ?? [];
  const trackedSlugs = useMemo(
    () =>
      new Set((trackedQuery.data?.tracked ?? []).map((t) => t.slug)),
    [trackedQuery.data],
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          📚 All scholarships
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real programmes, verified 7 Nov 2026. Entries marked “Unverified”
          still need a deadline check on the official site before you apply.
        </p>
      </header>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 pt-6">
          <div className="flex min-w-44 flex-col gap-1.5">
            <Label htmlFor="browse-level">Level</Label>
            <select
              id="browse-level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              <option value="all">All levels</option>
              <option value="bachelors">Bachelor&apos;s</option>
              <option value="masters">Master&apos;s</option>
              <option value="phd">PhD</option>
              <option value="postdoc">Postdoc</option>
            </select>
          </div>
          <div className="flex min-w-44 flex-col gap-1.5">
            <Label htmlFor="browse-status">Status</Label>
            <select
              id="browse-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="rolling">Rolling</option>
            </select>
          </div>
          <div className="flex min-w-56 flex-1 flex-col gap-1.5">
            <Label htmlFor="browse-search">Search</Label>
            <Input
              id="browse-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Chevening, Germany, Erasmus…"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {listQuery.isLoading
              ? "Loading…"
              : `${scholarships.length} programme${scholarships.length === 1 ? "" : "s"}`}
          </CardTitle>
          <CardDescription>
            Open programmes sort first, nearest deadline first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {listQuery.isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : listQuery.isError ? (
            <p className="text-sm text-red-600">
              Could not load scholarships — please reload the page.
            </p>
          ) : scholarships.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No programmes match these filters.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {scholarships.map((s) => (
                <li
                  key={s.slug}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/scholarships/${s.slug}`}
                      className="font-medium hover:underline"
                    >
                      {s.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {s.provider} · {s.country} · {s.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.deadlineNote}
                    </p>
                  </div>
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
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={trackedSlugs.has(s.slug)}
                      onClick={() =>
                        trackMutation.mutate({
                          viewerId,
                          slug: s.slug,
                          status: "interested",
                        })
                      }
                    >
                      {trackedSlugs.has(s.slug) ? "✓ Tracked" : "Track"}
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
