import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "./logo";

describe("Logo", () => {
  it("renders 'ERA' as real, accessible text in the primary lockup — never baked into the SVG", () => {
    render(<Logo />);
    expect(screen.getByText("ERA")).toBeInTheDocument();
  });

  it("renders the secondary (stacked) lockup with the same real text", () => {
    render(<Logo variant="secondary" />);
    expect(screen.getByText("ERA")).toBeInTheDocument();
  });

  it("the mark-only variant renders no visible text (decorative use)", () => {
    render(<Logo variant="mark" />);
    expect(screen.queryByText("ERA")).not.toBeInTheDocument();
  });

  it("the mark is hidden from assistive tech when accompanied by real text (avoids double-announcing)", () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});
