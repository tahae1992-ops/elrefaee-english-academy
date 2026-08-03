import type { Metadata } from "next";
import "./globals.css";

// Body/display type is the OS-native system font stack + Charter (doc 07
// §4.2, doc 09 §3) — a deliberate legibility-first choice for ESL
// readers, not a default-by-omission. No web fonts are loaded, so there
// is no network dependency or flash-of-unstyled-text risk for the type
// system at all.

export const metadata: Metadata = {
  title: "Elrefaee English Academy",
  description:
    "Learn American English with real certification, teacher support, and AI-augmented practice.",
};

// Applies the resolved theme before first paint, so there is no flash of
// the wrong theme while React hydrates (the ThemeToggle component then
// keeps this in sync via useSyncExternalStore for the rest of the page's
// lifetime). This is a deliberate, minimal, non-render-blocking script —
// not application logic — and it never throws, since a failure here
// should never break the page.
const noFlashOfWrongThemeScript = `
(function () {
  try {
    var stored = window.localStorage.getItem("elrefaee-theme-preference");
    var theme =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      // The inline script below intentionally sets data-theme before React
      // hydrates, which is expected to differ from the server-rendered
      // markup (SSR has no access to localStorage/matchMedia). This is
      // the documented, correct use of suppressHydrationWarning — it does
      // not suppress any *other* mismatch on this element.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashOfWrongThemeScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
