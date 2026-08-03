import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.08em] text-primary">
        Sprint 1 — Project Setup
      </p>
      <h1 className="max-w-xl font-display text-4xl font-bold text-balance">
        Elrefaee English Academy
      </h1>
      <p className="max-w-md text-muted-foreground">
        Platform foundation is live: design tokens, Clean Architecture
        skeleton, and the identity module&rsquo;s health check are wired end
        to end.
      </p>
      <ThemeToggle />
    </main>
  );
}
