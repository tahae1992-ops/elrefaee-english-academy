/**
 * Text direction per locale. Mirrors `shared.supported_locales.direction`
 * (DDD §3.12) — that table is the admin-facing source of truth for the
 * locale switcher; this code-level map exists so the render-critical
 * `dir` attribute doesn't cost a database round-trip on every request,
 * the same "cheap denormalization for a hot path" pattern DDD Principle
 * 8 already uses elsewhere. Keep in sync when a locale is added.
 */
const RTL_LOCALES = new Set(["ar", "he", "fa", "ur"]);

export function getLocaleDirection(locale: string): "ltr" | "rtl" {
  const language = locale.split("-")[0]?.toLowerCase();
  return RTL_LOCALES.has(language) ? "rtl" : "ltr";
}
