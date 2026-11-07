/**
 * Resolve the stable owner id for profile/tracking rows.
 * Signed-in users are keyed by email; anonymous browsers pass a
 * client-generated id (stored in localStorage); anything else falls back
 * to a shared local-dev id so the app works without sign-in.
 */
export function resolveViewer(
  ctx: { userEmail?: string | null } | undefined,
  viewerId?: string | null,
): string {
  if (ctx?.userEmail) return `email:${ctx.userEmail}`;
  if (viewerId && viewerId.trim().length >= 4)
    return `anon:${viewerId.trim()}`;
  return "local-dev";
}
