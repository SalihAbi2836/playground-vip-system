"use client";

import { ReactNode } from "react";
import { Badge, CapacityBar, cn } from "./ui";

export type Guest = {
  id: number;
  name: string;
  allowedGuests: number;
  checkedIn: number;
  created_at: string;
  category: string;
};

export function guestStatus(guest: Guest) {
  const remaining = guest.allowedGuests - guest.checkedIn;
  const isFull = guest.allowedGuests > 0 && remaining <= 0;
  // "Fast voll" erst, wenn tatsächlich schon jemand eingecheckt ist —
  // ein leerer Eintrag mit 2 Plätzen ist kein Warnfall.
  const isTight =
    guest.allowedGuests > 0 &&
    guest.checkedIn > 0 &&
    remaining > 0 &&
    remaining <= 2;
  return { remaining, isFull, isTight };
}

/* Runder Stepper-Button — das Haupt-Touchziel an der Tür */
function StepButton({
  label,
  onClick,
  disabled,
  tone,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone: "in" | "out";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border",
        "text-lg font-semibold transition-all duration-150 active:scale-90",
        "disabled:cursor-not-allowed disabled:border-ink-800 disabled:bg-ink-850",
        "disabled:text-fg-faint disabled:active:scale-100",
        tone === "in"
          ? "border-ok/35 bg-ok/15 text-ok hover:bg-ok/25 hover:border-ok/60"
          : "border-ink-700 bg-ink-800 text-fg-muted hover:bg-ink-700 hover:text-fg"
      )}
    >
      {children}
    </button>
  );
}

export function GuestCard({
  guest,
  onCheckIn,
  onCheckOut,
  footer,
  showAddedTime,
}: {
  guest: Guest;
  onCheckIn: () => void;
  onCheckOut: () => void;
  footer?: ReactNode;
  showAddedTime?: boolean;
}) {
  const { remaining, isFull, isTight } = guestStatus(guest);
  const isVip = guest.category === "VIP";

  return (
    <article
      className={cn(
        "rounded-card border bg-ink-900 p-4 transition-colors duration-200",
        isFull
          ? "border-danger/35"
          : isTight
            ? "border-warn/30"
            : "border-ink-800 hover:border-ink-700"
      )}
    >
      {/* Kopfzeile: Name + Kategorie */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold leading-snug text-fg">
            {guest.name}
          </h2>
          {showAddedTime ? (
            <p className="mt-0.5 text-xs text-fg-faint">
              Hinzugefügt{" "}
              {new Date(guest.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          ) : null}
        </div>
        <Badge tone={isVip ? "vip" : "neutral"}>{guest.category}</Badge>
      </div>

      {/* Auslastung */}
      <div className="mt-3.5">
        <CapacityBar used={guest.checkedIn} total={guest.allowedGuests} />
      </div>

      {/* Zähler + Stepper */}
      <div className="mt-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="tabular text-lg font-semibold leading-none text-fg">
            {guest.checkedIn}
            <span className="text-fg-faint"> / {guest.allowedGuests}</span>
          </p>
          <p
            className={cn(
              "mt-1 text-xs font-medium",
              isFull ? "text-danger" : isTight ? "text-warn" : "text-fg-muted"
            )}
          >
            {isFull
              ? "Limit erreicht"
              : `noch ${remaining} ${remaining === 1 ? "Platz" : "Plätze"}`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <StepButton
            label={`Check-out für ${guest.name}`}
            tone="out"
            onClick={onCheckOut}
            disabled={guest.checkedIn <= 0}
          >
            −
          </StepButton>
          <StepButton
            label={`Check-in für ${guest.name}`}
            tone="in"
            onClick={onCheckIn}
            disabled={isFull}
          >
            +
          </StepButton>
        </div>
      </div>

      {footer ? (
        <div className="mt-4 border-t border-ink-800 pt-3">{footer}</div>
      ) : null}
    </article>
  );
}
