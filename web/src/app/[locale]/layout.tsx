import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getLocaleDirection } from "@/i18n/locale-direction";
import { TooltipProvider } from "@/components/ui/tooltip";
import "../globals.css";

// Body/display type is the OS-native system font stack + Charter (doc 07
// §4.2, doc 09 §3) — a deliberate legibility-first choice for ESL
// readers, not a default-by-omission. No web fonts are loaded, so there
// is no network dependency or flash-of-unstyled-text risk for the type
// system at all.

// Brand Book §7: "EREA" is the public/product brand used everywhere in
// the app, including page titles; the full legal name ("Elrefaee
// English Academy") stays in the description, where a search result or
// share-preview genuinely benefits from the fuller institutional name.
export const metadata: Metadata = {
  title: {
    default: "EREA",
    template: "%s · EREA",
  },
  description:
    "EREA (Elrefaee English Academy) — learn American English with real certification, teacher support, and AI-augmented practice.",
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // The [locale] segment acts as a catch-all for any unmatched path
  // (next-intl's own documented caveat) — an invalid value here must
  // 404, not silently fall back, or an unknown URL like /xx/foo would
  // render as if it were a real locale.
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      dir={getLocaleDirection(locale)}
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
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
