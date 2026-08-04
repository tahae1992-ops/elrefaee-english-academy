import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { UserMenu } from "@/components/app-shell/user-menu";

export function TopNav({ displayName, email }: { displayName: string; email: string }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <Logo variant="mark" className="h-6 w-6 md:hidden" />
      <Logo className="hidden md:flex" />
      <div className="flex items-center gap-2">
        <LocaleSwitcher />
        <ThemeToggle />
        <UserMenu displayName={displayName} email={email} />
      </div>
    </header>
  );
}
