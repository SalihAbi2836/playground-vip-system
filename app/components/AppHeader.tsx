"use client";

import { Button } from "./ui";

export function AppHeader({
  mode,
  onExit,
  children,
}: {
  mode: string;
  onExit: () => void;
  children?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-ink-800 bg-ink-950/85 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              Playground
            </span>
            <span className="text-ink-600">/</span>
            <h1 className="text-sm font-medium text-fg">{mode}</h1>
          </div>

          <Button variant="ghost" size="sm" onClick={onExit}>
            Abmelden
          </Button>
        </div>

        {children ? <div className="mt-3">{children}</div> : null}
      </div>
    </header>
  );
}
