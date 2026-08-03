import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

describe("Checkbox", () => {
  it("is keyboard-operable and toggles on click, associated with its label", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <div>
        <Checkbox id="terms" onCheckedChange={onChange} />
        <Label htmlFor="terms">I agree to the Terms</Label>
      </div>,
    );

    const checkbox = screen.getByRole("checkbox", {
      name: /i agree to the terms/i,
    });
    expect(checkbox).not.toBeChecked();

    // Unchecked by default is the requirement this component exists to
    // guarantee (doc 08 §4.5 — a terms checkbox must never be
    // pre-checked); asserted explicitly, not just assumed from absence.
    await user.click(checkbox);
    expect(onChange).toHaveBeenCalledWith(true);

    checkbox.focus();
    await user.keyboard("[Space]");
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
