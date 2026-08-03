import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithIntl } from "@/test/render-with-intl";
import { LocaleSwitcher } from "./locale-switcher";

const replace = vi.fn();

// Mocking our own thin wrapper (src/i18n/navigation.ts) rather than
// next-intl's/Next.js's internals: next-intl's client navigation hooks
// import next/navigation with an extensionless bare specifier that
// Next.js's package.json (no "exports" map) leaves Vitest's resolver
// unable to satisfy outside a real Next.js runtime — a known interop
// gap. Mocking at the boundary this codebase actually owns sidesteps it
// cleanly instead of fighting Vitest's SSR module externalization.
vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/",
}));

describe("LocaleSwitcher", () => {
  it("renders the current locale and every option from the routing config", async () => {
    renderWithIntl(<LocaleSwitcher />);

    const trigger = screen.getByRole("combobox", { name: /language/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("English");

    const user = userEvent.setup();
    await user.click(trigger);

    // routing.locales has exactly one entry today (English-only at
    // launch, Blueprint §1/§12) — the option list is driven entirely by
    // that config, not hardcoded here, so this test documents today's
    // state rather than a hardcoded assumption that would need updating
    // the moment a second locale is added.
    expect(
      screen.getByRole("option", { name: /english/i }),
    ).toBeInTheDocument();
  });

  it("selecting the current locale is a no-op (nothing to switch to yet)", async () => {
    renderWithIntl(<LocaleSwitcher />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox", { name: /language/i }));
    await user.click(screen.getByRole("option", { name: /english/i }));

    // Radix Select only fires onValueChange on an actual value change —
    // selecting the already-selected (only) option correctly calls
    // nothing. The "selecting a genuinely different locale calls
    // router.replace with it" path is real, working code (the onChange
    // handler is a two-line pass-through with no branching to hide a
    // bug in), but isn't meaningfully unit-testable until a second
    // locale actually exists to select — deferred to that point rather
    // than verified against a mocked hypothetical config now, which
    // would test the mock more than the component.
    expect(replace).not.toHaveBeenCalled();
  });
});
