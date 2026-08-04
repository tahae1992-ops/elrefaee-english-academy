import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithIntl } from "@/test/render-with-intl";
import { UserMenu } from "./user-menu";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

describe("UserMenu", () => {
  it("shows initials, name, and email; opens to reveal Sign out", async () => {
    renderWithIntl(<UserMenu displayName="Taha Confirm Test" email="taha@example.com" />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /open account menu/i }));

    expect(screen.getByText("TC")).toBeInTheDocument();
    expect(screen.getByText("Taha Confirm Test")).toBeInTheDocument();
    expect(screen.getByText("taha@example.com")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /sign out/i })).toBeInTheDocument();
  });

  it("signing out calls the logout API then redirects to /login", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    vi.stubGlobal("fetch", fetchMock);
    renderWithIntl(<UserMenu displayName="Taha Confirm Test" email="taha@example.com" />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /open account menu/i }));
    await user.click(screen.getByRole("menuitem", { name: /sign out/i }));

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/auth/logout", { method: "POST" });
    expect(push).toHaveBeenCalledWith("/login");
    vi.unstubAllGlobals();
  });
});
