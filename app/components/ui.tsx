"use client";

import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Helper                                                              */
/* ------------------------------------------------------------------ */

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "secondary" | "ghost" | "success" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 font-medium rounded-control " +
  "transition-[background-color,border-color,color,transform] duration-150 " +
  "active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 select-none";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-ink-950 hover:bg-[#e0be7c] disabled:bg-ink-700 disabled:text-fg-faint",
  secondary:
    "bg-ink-800 text-fg border border-ink-700 hover:bg-ink-700 hover:border-ink-600 " +
    "disabled:bg-ink-850 disabled:text-fg-faint disabled:border-ink-800",
  ghost:
    "bg-transparent text-fg-muted hover:text-fg hover:bg-ink-850 " +
    "disabled:text-fg-faint disabled:hover:bg-transparent",
  success:
    "bg-ok/15 text-ok border border-ok/30 hover:bg-ok/25 hover:border-ok/50 " +
    "disabled:bg-ink-850 disabled:text-fg-faint disabled:border-ink-800",
  danger:
    "bg-danger/10 text-danger border border-danger/25 hover:bg-danger/20 hover:border-danger/45 " +
    "disabled:bg-ink-850 disabled:text-fg-faint disabled:border-ink-800",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-base px-5 py-3.5",
};

export function Button({
  variant = "secondary",
  size = "md",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Input                                                               */
/* ------------------------------------------------------------------ */

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full bg-ink-850 text-fg placeholder:text-fg-faint",
        "border border-ink-700 rounded-control",
        "px-3.5 py-2.5 text-sm",
        "transition-colors duration-150",
        "hover:border-ink-600 focus:border-accent-soft focus:bg-ink-800",
        className
      )}
      {...props}
    />
  );
}

export function SearchInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative", className)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-faint"
      >
        <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="m13.5 13.5 3 3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <input
        className={cn(
          "w-full bg-ink-850 text-fg placeholder:text-fg-faint",
          "border border-ink-700 rounded-control",
          "pl-10 pr-3.5 py-2.5 text-sm",
          "transition-colors duration-150",
          "hover:border-ink-600 focus:border-accent-soft focus:bg-ink-800"
        )}
        {...props}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Badge                                                               */
/* ------------------------------------------------------------------ */

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "vip" | "ok" | "warn" | "danger";
  children: ReactNode;
}) {
  const tones = {
    neutral: "bg-ink-800 text-fg-muted border-ink-700",
    vip: "bg-accent-dim text-accent border-accent-soft/50",
    ok: "bg-ok-dim text-ok border-ok/30",
    warn: "bg-warn-dim text-warn border-warn/30",
    danger: "bg-danger-dim text-danger border-danger/30",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5",
        "text-[11px] font-medium uppercase tracking-wider",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Stat                                                                */
/* ------------------------------------------------------------------ */

export function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex-1 min-w-[100px] rounded-card border border-ink-800 bg-ink-900 px-4 py-3">
      <p className="text-[11px] uppercase tracking-wider text-fg-faint">{label}</p>
      <p
        className={cn(
          "tabular mt-1 text-2xl font-semibold leading-none",
          accent ? "text-accent" : "text-fg"
        )}
      >
        {value}
        {sub ? (
          <span className="ml-1 text-sm font-normal text-fg-faint">{sub}</span>
        ) : null}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Capacity bar — zeigt Auslastung auf einen Blick                     */
/* ------------------------------------------------------------------ */

export function CapacityBar({
  used,
  total,
}: {
  used: number;
  total: number;
}) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const tone =
    total <= 0
      ? "bg-ink-600"
      : used >= total
        ? "bg-danger"
        : total - used <= 2
          ? "bg-warn"
          : "bg-ok";

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-800">
      <div
        className={cn("h-full rounded-full transition-[width] duration-300", tone)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */

export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="rounded-card border border-dashed border-ink-700 bg-ink-900/50 px-6 py-14 text-center">
      <p className="text-sm font-medium text-fg-muted">{title}</p>
      {hint ? <p className="mt-1 text-sm text-fg-faint">{hint}</p> : null}
    </div>
  );
}
