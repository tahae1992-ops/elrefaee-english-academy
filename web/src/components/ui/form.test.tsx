import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input } from "./input";
import { Button } from "./button";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

function TestForm({ onSubmit }: { onSubmit: (values: z.infer<typeof schema>) => void }) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

describe("Form primitives", () => {
  it("has a persistent, associated label — never placeholder-as-label (doc 07 §5.2)", () => {
    render(<TestForm onSubmit={vi.fn()} />);
    // A real <label for="..."> association, not just visually adjacent text.
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("shows no error before the first blur/submit (doc 09 §5.2 — never on first keystroke)", () => {
    render(<TestForm onSubmit={vi.fn()} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows a validation error on submit and marks the input aria-invalid, wired for a screen reader via aria-describedby", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TestForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    const message = await screen.findByRole("alert");
    expect(message).toHaveTextContent("Enter a valid email address");

    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toContain(
      message.id,
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits successfully once the value is valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TestForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Email"), "yuki@example.com");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      { email: "yuki@example.com" },
      expect.anything(),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
