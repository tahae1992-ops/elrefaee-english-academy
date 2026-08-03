import { cn } from "@/lib/utils";

/**
 * The live, theme-aware EREA mark — distinct from the static files in
 * public/brand/ (which are fixed-color, portable assets for external
 * use). This component uses `currentColor` so it inherits whichever
 * text-color token its container sets, meaning it's correct in light
 * mode, dark mode, and any future high-contrast mode (doc 07 §3)
 * automatically, with zero separate dark-mode asset to keep in sync.
 *
 * Geometry matches public/brand/monogram.svg exactly (docs/12
 * -brand-book.md §2.1) — bar widths 34/55/76, height 14, gap 8.
 */
function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("text-primary", className)}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="22" y="21" width="34" height="14" rx="7" fill="currentColor" />
      <rect x="22" y="43" width="55" height="14" rx="7" fill="currentColor" />
      <rect x="22" y="65" width="76" height="14" rx="7" fill="currentColor" />
    </svg>
  );
}

type LogoProps = {
  /** "primary" = horizontal lockup, "secondary" = stacked, "mark" = symbol only. */
  variant?: "primary" | "secondary" | "mark";
  className?: string;
};

/**
 * The Primary/Secondary Logo and bare Monogram, as one component (Brand
 * Book §2.2) — "EREA" is always real text, never baked into the SVG, so
 * it stays a genuine heading for accessibility/SEO rather than an
 * opaque image.
 */
export function Logo({ variant = "primary", className }: LogoProps) {
  if (variant === "mark") {
    return <Mark className={cn("h-8 w-8", className)} />;
  }

  if (variant === "secondary") {
    return (
      <span className={cn("inline-flex flex-col items-center gap-2", className)}>
        <Mark className="h-10 w-10" />
        <span className="font-display text-2xl font-bold tracking-[-0.01em]">
          EREA
        </span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Mark className="h-7 w-7" />
      <span className="font-display text-2xl font-bold tracking-[-0.01em]">
        EREA
      </span>
    </span>
  );
}
