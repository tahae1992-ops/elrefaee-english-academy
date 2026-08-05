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

    expect(screen.queryByRole("link", { name: /certificates/i })).not.toBeInTheDocument();
    const certificates = screen.getByText("Certificates").closest("span");
    expect(certificates).toHaveAttribute("aria-disabled", "true");
  });

  it("renders Review (Review Engine slice) as a real link", () => {
    renderWithIntl(<SidebarNav />);

    const review = screen.getByRole("link", { name: /review/i });
    expect(review).toHaveAttribute("href", "/review");
  });

  it("renders Courses (Course Catalog slice) as a real link", () => {
    renderWithIntl(<SidebarNav />);

    const courses = screen.getByRole("link", { name: /courses/i });
    expect(courses).toHaveAttribute("href", "/courses");
  });
});
