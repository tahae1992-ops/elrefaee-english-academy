import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "@/test/render-with-intl";
import { CefrLevelCard } from "./cefr-level-card";

describe("CefrLevelCard", () => {
  it("shows the not-assessed empty state and a zero progress bar when currentLevel is null", () => {
    renderWithIntl(<CefrLevelCard currentLevel={null} />);

    expect(screen.getByText("Not yet assessed")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("shows the level label and a non-zero progress bar when currentLevel is set", () => {
    renderWithIntl(<CefrLevelCard currentLevel="b1" />);

    expect(screen.getByText("B1")).toBeInTheDocument();
    const bar = screen.getByRole("progressbar");
    // b1 is index 3 of 6 levels -> (4/6)*100 = 66.67%
    expect(Number(bar.getAttribute("aria-valuenow"))).toBeCloseTo(66.67, 1);
  });
});
