"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

type ThemePreference = "light" | "dark";

const STORAGE_KEY = "elrefaee-theme-preference";

function resolvePreference(): ThemePreference {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function subscribe(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  window.addEventListener("storage", callback);
  return () => {
    media.removeEventListener("change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot(): ThemePreference {
  // Deterministic SSR value — corrected on the client via
  // useSyncExternalStore's built-in hydration-safe re-sync, not a manual
  // effect+setState (React's documented anti-pattern this replaces).
  return "light";
}

/**
 * Doc 07 §3/§4.1's dark-mode contract, made concrete: an explicit user
 * choice (persisted) always wins over the OS preference, and the choice
 * stays in sync across tabs and OS-preference changes.
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribe,
    resolvePreference,
    getServerSnapshot,
  );

  // A *side effect* syncing the resolved value to the DOM attribute is
  // exactly what useEffect is for — this is not a setState call, so it
  // doesn't trigger the cascading-render anti-pattern the initial
  // implementation had.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function toggle() {
    const next: ThemePreference = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem(STORAGE_KEY, next);
    // localStorage.setItem doesn't fire a 'storage' event in the same tab
    // that wrote it (only in other tabs) — dispatch one so this tab's
    // useSyncExternalStore subscription re-reads immediately.
    window.dispatchEvent(new StorageEvent("storage"));
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle} aria-pressed={theme === "dark"}>
      {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    </Button>
  );
}
