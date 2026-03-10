export function requireAuthOrRedirect({ isAuthenticated, nav, loc, nextPath }) {
  if (isAuthenticated) return true;
  const fallbackNext = `${loc?.pathname || "/"}${loc?.search || ""}`;
  const resolvedNext = nextPath || fallbackNext || "/";
  const next = encodeURIComponent(resolvedNext);
  nav(`/auth/login?next=${next}`, { replace: true });
  return false;
}
