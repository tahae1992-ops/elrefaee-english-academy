import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "@/test/render-with-intl";
import { SidebarNav } from "./sidebar-nav";

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/dashboard",
  Link: ({ href, children, ...props }: React.ComponentProps<"a"> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("SidebarNav", () => {
  it("marks the active route with aria-current and renders it as a real link", () => {
    renderWithIntl(<SidebarNav />);

    const home = screen.getByRole("link", { name: /home/i });
    expect(home).toHaveAttribute("aria-current", "page");
    expect(home).toHaveAttribute("href", "/dashboard");
  });

  it("renders not-yet-built items as disabled, not as dead links", () => {
    renderWithIntl(<SidebarNav />);

    expect(screen.queryByRole("link", { name: /courses/i })).not.toBeInTheDocument();
    const courses = screen.getByText("Courses").closest("span");
    expect(courses).toHaveAttribute("aria-disabled", "true");
  });
});
