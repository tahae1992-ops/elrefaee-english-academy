"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

const demoSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

/**
 * The real component library, rendered live — not a mockup. Every
 * component here is the exact one Sprint 2's screens (and every screen
 * after it) import. This is the verification artifact the Brand Book /
 * Design System Phase 2 approval gate is checked against.
 */
export default function DesignSystemPage() {
  const [checked, setChecked] = useState(false);
  const form = useForm<z.infer<typeof demoSchema>>({
    resolver: zodResolver(demoSchema),
    defaultValues: { email: "" },
  });

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-12 p-8">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-primary">
          Internal — Component Library Verification
        </p>
        <h1 className="font-display text-3xl font-bold">
          EREA Design System
        </h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LocaleSwitcher />
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold">
          Badges &amp; Tags
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>B1 · Intermediate</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Failed</Badge>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold">Alerts</h2>
        <Alert>
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>
            A default, informational alert using the shared component.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            We couldn&apos;t save your answer — check your connection and
            try again.
          </AlertDescription>
        </Alert>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold">Card</h2>
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Continue lesson</CardTitle>
            <CardDescription>Unit 4, Lesson 2</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm">Continue</Button>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold">
          Checkbox &amp; Label
        </h2>
        <div className="flex items-center gap-2">
          <Checkbox
            id="ds-terms"
            checked={checked}
            onCheckedChange={(value) => setChecked(value === true)}
          />
          <Label htmlFor="ds-terms">I agree to the Terms</Label>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold">
          Form (react-hook-form + Zod, the pattern every future form uses)
        </h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(() => {})}
            className="flex max-w-sm flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </section>
    </main>
  );
}
