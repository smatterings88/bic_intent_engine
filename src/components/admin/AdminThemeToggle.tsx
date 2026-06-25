"use client";

import { Moon, Sun } from "lucide-react";

import { useAdminTheme } from "@/components/admin/AdminThemeProvider";
import { Switch } from "@/components/ui/switch";

export function AdminThemeToggle() {
  const { isDark, setTheme, mounted } = useAdminTheme();

  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm">
      <Sun className="h-4 w-4 text-muted-foreground" aria-hidden={isDark} />
      <Switch
        checked={mounted ? isDark : false}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle dark mode"
        disabled={!mounted}
      />
      <Moon className="h-4 w-4 text-muted-foreground" aria-hidden={!isDark} />
      <span className="sr-only">Dark mode</span>
      <span className="hidden text-muted-foreground sm:inline">Dark mode</span>
    </div>
  );
}
