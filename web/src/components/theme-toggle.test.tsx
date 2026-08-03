import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "./theme-toggle";

function mockMatchMedia(prefersDark: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("dark") ? prefersDark : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("applies the OS preference on first render when no stored choice exists", async () => {
    mockMatchMedia(true);
    render(<ThemeToggle />);

    await waitFor(() =>
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark"),
    );
  });

  it("toggles data-theme and persists the explicit choice", async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = await screen.findByRole("button", {
      name: /switch to dark mode/i,
    });
    await user.click(button);

    await waitFor(() =>
      expect(document.documentElement.getAttribute("data-theme")).toBe(
        "dark",
      ),
    );
    expect(window.localStorage.getItem("elrefaee-theme-preference")).toBe(
      "dark",
    );

    await user.click(
      await screen.findByRole("button", { name: /switch to light mode/i }),
    );
    await waitFor(() =>
      expect(document.documentElement.getAttribute("data-theme")).toBe(
        "light",
      ),
    );
  });

  it("an explicit stored choice overrides the OS preference (doc 07 §3's contract)", async () => {
    mockMatchMedia(true); // OS says dark...
    window.localStorage.setItem("elrefaee-theme-preference", "light"); // ...user chose light

    render(<ThemeToggle />);

    await waitFor(() =>
      expect(document.documentElement.getAttribute("data-theme")).toBe(
        "light",
      ),
    );
  });

  it("still toggles the DOM attribute even when localStorage throws (e.g. private browsing)", async () => {
    mockMatchMedia(false);
    const getItemSpy = vi
      .spyOn(window.localStorage.__proto__, "getItem")
      .mockImplementation(() => {
        throw new DOMException("blocked", "SecurityError");
      });
    const setItemSpy = vi
      .spyOn(window.localStorage.__proto__, "setItem")
      .mockImplementation(() => {
        throw new DOMException("blocked", "SecurityError");
      });
    const user = userEvent.setup();

    render(<ThemeToggle />);

    const button = await screen.findByRole("button", {
      name: /switch to dark mode/i,
    });
    await user.click(button);

    await waitFor(() =>
      expect(document.documentElement.getAttribute("data-theme")).toBe(
        "dark",
      ),
    );

    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });
});
