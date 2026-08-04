import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { TooltipProvider } from "@/components/ui/tooltip";
import messages from "../../messages/en.json";

/**
 * Every component using `useTranslations`/`useLocale` needs an
 * `NextIntlClientProvider` ancestor — this is the one shared place that
 * wraps React Testing Library's `render` with it, so individual test
 * files don't each reinvent the provider boilerplate. Also wraps
 * `TooltipProvider` since the real app does too (root layout.tsx) —
 * any component using `Tooltip` throws without it.
 */
export function renderWithIntl(ui: ReactElement, locale = "en") {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <TooltipProvider>{ui}</TooltipProvider>
    </NextIntlClientProvider>,
  );
}
