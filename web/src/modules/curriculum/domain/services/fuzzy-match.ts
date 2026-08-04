/**
 * SRS FR-07's Exception Flow: free-text answers are fuzzy-matched, not
 * exact-string-only. Tolerance is exactly as specified: Levenshtein
 * distance <= 1 for answers up to 6 characters, <= 2 for longer ones.
 * Applied to the whole (trimmed, lowercased) answer string — the SRS
 * doesn't specify per-word tokenization for multi-word answers, so a
 * multi-word accepted answer is treated as one string for this rule,
 * same as a single word.
 */

export function levenshteinDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, (_, i) => [i, ...Array(cols - 1).fill(0)]);
  for (let j = 0; j < cols; j++) matrix[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  return matrix[rows - 1][cols - 1];
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** True if `submitted` is an exact or FR-07-tolerance fuzzy match for `accepted`. */
export function fuzzyMatches(submitted: string, accepted: string): boolean {
  const s = normalize(submitted);
  const a = normalize(accepted);
  if (s === a) return true;

  const maxDistance = a.length <= 6 ? 1 : 2;
  return levenshteinDistance(s, a) <= maxDistance;
}

/** True if `submitted` fuzzy-matches any of the exercise's accepted answers. */
export function matchesAnyAcceptedAnswer(submitted: string, acceptedAnswers: string[]): boolean {
  return acceptedAnswers.some((accepted) => fuzzyMatches(submitted, accepted));
}
