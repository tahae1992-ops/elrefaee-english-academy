/**
 * SAD §7.5: "Every AI Gateway call passes input *and* output through a
 * moderation check before reaching the user, with per-module severity
 * thresholds (Conversation Partner and AI Tutor set strictest)." This
 * is a Phase 1 rule-based safety filter for the most severe categories
 * (self-harm, sexual content involving minors, explicit sexual
 * content, violent-harm instructions) — not a dedicated third-party
 * moderation-API integration, the same kind of disclosed phasing
 * decision as Pronunciation's "Phase 1 = browser Web Speech API"
 * (Blueprint §10). Scope discipline (off-topic redirection, EDD §18)
 * is a separate concern handled by the system prompt itself, not by
 * this safety filter — an off-topic message isn't unsafe, it's just
 * out of scope.
 *
 * Deliberately conservative and narrow: real moderation-API vendors
 * (e.g. a dedicated content-safety classifier) cover far more nuance
 * than pattern matching ever can. This exists so the Gateway has a
 * real, functioning checkpoint now rather than none — swapping in a
 * dedicated provider later is a new check added to `SEVERE_PATTERNS`'
 * evaluation pipeline, not an architecture change.
 */

export type ModerationSeverity = "none" | "flagged" | "blocked";

export interface ModerationResult {
  severity: ModerationSeverity;
  reasons: string[];
}

interface SeverityPattern {
  reason: string;
  pattern: RegExp;
  severity: Exclude<ModerationSeverity, "none">;
}

const SEVERE_PATTERNS: SeverityPattern[] = [
  { reason: "self-harm", pattern: /\b(kill myself|suicide|end my life|self[- ]harm|hurt myself)\b/i, severity: "blocked" },
  { reason: "sexual content involving minors", pattern: /\b(child|kid|minor)s?\b[\s\S]{0,40}\b(sex|nude|naked)\b/i, severity: "blocked" },
  { reason: "explicit sexual content", pattern: /\b(porn|explicit sex|sexual acts?)\b/i, severity: "blocked" },
  { reason: "violent harm instructions", pattern: /\b(how to (make|build) a (bomb|weapon)|how to kill)\b/i, severity: "blocked" },
  { reason: "hate speech", pattern: /\b(slur|racial slur)\b/i, severity: "flagged" },
];

function evaluate(text: string): ModerationResult {
  const reasons: string[] = [];
  let severity: ModerationSeverity = "none";

  for (const { reason, pattern, severity: matchSeverity } of SEVERE_PATTERNS) {
    if (pattern.test(text)) {
      reasons.push(reason);
      if (matchSeverity === "blocked" || severity === "none") {
        severity = matchSeverity;
      }
    }
  }

  return { severity, reasons };
}

export function moderateInput(text: string): ModerationResult {
  return evaluate(text);
}

export function moderateOutput(text: string): ModerationResult {
  return evaluate(text);
}
