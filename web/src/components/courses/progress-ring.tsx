/** doc 09 §6 "Course Details": "primary-600 ring fill on neutral-100 track." */
export function ProgressRing({ percent, label }: { percent: number; label: string }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="relative flex size-20 shrink-0 items-center justify-center">
      <svg viewBox="0 0 72 72" className="size-20 -rotate-90">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="var(--muted)" strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute font-display text-lg font-bold" aria-label={label}>
        {percent}%
      </span>
    </div>
  );
}
