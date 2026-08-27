"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "./ui";

export function PinScreen({
  title,
  subtitle,
  expectedPin,
  onSuccess,
}: {
  title: string;
  subtitle: string;
  expectedPin: string;
  onSuccess: () => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const submit = () => {
    if (pin === expectedPin) {
      onSuccess();
      return;
    }
    setError(true);
    setShake(true);
    setPin("");
    window.setTimeout(() => setShake(false), 400);
  };

  return (
    <main className="page-glow flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div
        className={`w-full max-w-[340px] ${shake ? "animate-[pin-shake_0.4s_ease-in-out]" : ""}`}
      >
        <div className="rounded-card border border-ink-800 bg-ink-900 p-7">
          <div className="mb-6 text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-accent">
              Playground
            </p>
            <h1 className="mt-2 text-xl font-semibold text-fg">{title}</h1>
            <p className="mt-1 text-sm text-fg-faint">{subtitle}</p>
          </div>

          <label htmlFor="pin" className="sr-only">
            PIN
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            placeholder="••••"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              if (error) setError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            className={`w-full rounded-control border bg-ink-850 px-4 py-3.5 text-center
              text-2xl tracking-[0.5em] text-fg placeholder:tracking-[0.4em]
              placeholder:text-fg-faint transition-colors
              ${error ? "border-danger" : "border-ink-700 focus:border-accent-soft"}`}
          />

          <p
            role="status"
            className={`mt-2 h-4 text-center text-xs ${
              error ? "text-danger" : "text-transparent"
            }`}
          >
            Falscher PIN
          </p>

          <Button
            variant="primary"
            size="lg"
            className="mt-2 w-full"
            onClick={submit}
            disabled={pin.length === 0}
          >
            Entsperren
          </Button>
        </div>

        <Link
          href="/"
          className="mt-5 block text-center text-sm text-fg-faint transition-colors hover:text-fg-muted"
        >
          ← Zur Auswahl
        </Link>
      </div>

      <style>{`
        @keyframes pin-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </main>
  );
}
