import Link from "next/link";

function ModeCard({
  href,
  label,
  title,
  description,
  icon,
}: {
  href: string;
  label: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex-1 rounded-card border border-ink-800 bg-ink-900 p-6
                 transition-all duration-200
                 hover:border-accent-soft/60 hover:bg-ink-850
                 focus-visible:border-accent-soft/60"
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full
                   border border-ink-700 bg-ink-800 text-fg-muted
                   transition-colors duration-200
                   group-hover:border-accent-soft/50 group-hover:text-accent"
      >
        {icon}
      </div>

      <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-fg-faint">
        {label}
      </p>
      <h2 className="mt-1.5 text-lg font-semibold text-fg">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
        {description}
      </p>

      <span
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-fg-faint
                   transition-colors duration-200 group-hover:text-accent"
      >
        Öffnen
        <span className="transition-transform duration-200 group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="page-glow flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-accent">
            Playground
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-fg md:text-4xl">
            VIP System
          </h1>
          <p className="mt-3 text-sm text-fg-muted">
            Nur für autorisiertes Personal. Modus wählen.
          </p>
        </div>

        <div className="hairline mx-auto mt-10 h-px w-full" />

        <div className="mt-10 flex flex-col gap-4 md:flex-row">
          <ModeCard
            href="/door"
            label="Einlass"
            title="Door Mode"
            description="Gäste suchen, ein- und auschecken. Live-Kapazität pro Eintrag."
            icon={
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                <path
                  d="M4 17V4.5a1 1 0 0 1 .8-.98l7-1.4A1 1 0 0 1 13 3.1v13.8a1 1 0 0 1-1.2.98l-7-1.4A1 1 0 0 1 4 15.5V17Zm0 0h11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="10.5" cy="10" r="0.9" fill="currentColor" />
              </svg>
            }
          />

          <ModeCard
            href="/admin"
            label="Verwaltung"
            title="Admin Mode"
            description="VIPs und Gästeliste anlegen, bearbeiten und entfernen."
            icon={
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                <circle
                  cx="10"
                  cy="6.5"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M3.5 17a6.5 6.5 0 0 1 13 0"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
        </div>
      </div>
    </main>
  );
}
