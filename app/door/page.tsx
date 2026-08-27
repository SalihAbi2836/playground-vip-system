"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { AppHeader } from "../components/AppHeader";
import { GuestCard, Guest } from "../components/GuestCard";
import { PinScreen } from "../components/PinScreen";
import { EmptyState, SearchInput, Stat, cn } from "../components/ui";

const DOOR_PIN = "5678";

type Filter = "Alle" | "VIP" | "Guestlist";

export default function DoorPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("Alle");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Auth-Status liegt in localStorage, also erst nach dem Mount lesbar —
    // deshalb bewusst im Effect. `ready` verhindert Hydration-Mismatch.
    if (localStorage.getItem("door-auth") === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthenticated(true);
    }
     
    setReady(true);
  }, []);

  const fetchGuests = useCallback(async () => {
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .order("id", { ascending: false });

    setLoading(false);

    if (error) {
      console.log(error);
      return;
    }

    if (data) {
      setGuests(data);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGuests();
  }, [fetchGuests]);

  useEffect(() => {
    const channel = supabase
      .channel("guests-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guests" },
        () => {
          fetchGuests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchGuests]);

  const checkInGuest = async (guest: Guest) => {
    if (guest.checkedIn >= guest.allowedGuests) return;

    // Optimistisch aktualisieren — an der Tür soll der Tap sofort wirken
    setGuests((prev) =>
      prev.map((g) =>
        g.id === guest.id ? { ...g, checkedIn: g.checkedIn + 1 } : g
      )
    );

    const { error } = await supabase
      .from("guests")
      .update({ checkedIn: guest.checkedIn + 1 })
      .eq("id", guest.id);

    if (error) {
      console.log(error);
    }

    fetchGuests();
  };

  const checkOutGuest = async (guest: Guest) => {
    if (guest.checkedIn <= 0) return;

    setGuests((prev) =>
      prev.map((g) =>
        g.id === guest.id ? { ...g, checkedIn: g.checkedIn - 1 } : g
      )
    );

    const { error } = await supabase
      .from("guests")
      .update({ checkedIn: guest.checkedIn - 1 })
      .eq("id", guest.id);

    if (error) {
      console.log(error);
    }

    fetchGuests();
  };

  const totalCheckedIn = guests.reduce((sum, g) => sum + g.checkedIn, 0);
  const totalAllowedGuests = guests.reduce((sum, g) => sum + g.allowedGuests, 0);
  const totalVIPs = guests.filter((g) => g.category === "VIP").length;
  const totalGuestlist = guests.filter((g) => g.category === "Guestlist").length;

  const visible = guests
    .filter((g) => filter === "Alle" || g.category === filter)
    .filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));

  // Kein Flackern des PIN-Screens beim ersten Render
  if (!ready) {
    return <main className="min-h-screen bg-ink-950" />;
  }

  if (!isAuthenticated) {
    return (
      <PinScreen
        title="Door Mode"
        subtitle="PIN eingeben, um den Einlass zu starten"
        expectedPin={DOOR_PIN}
        onSuccess={() => {
          localStorage.setItem("door-auth", "true");
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader
        mode="Door Mode"
        onExit={() => {
          localStorage.removeItem("door-auth");
          window.location.href = "/";
        }}
      >
        <SearchInput
          type="text"
          placeholder="Namen suchen…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </AppHeader>

      <main className="mx-auto max-w-5xl px-4 py-5 md:px-6 md:py-8">
        {/* Stats */}
        <div className="flex gap-3">
          <Stat
            label="Eingecheckt"
            value={totalCheckedIn}
            sub={`/ ${totalAllowedGuests}`}
            accent
          />
          <Stat label="VIPs" value={totalVIPs} />
          <Stat label="Gästeliste" value={totalGuestlist} />
        </div>

        {/* Filter */}
        <div className="mt-5 flex gap-1.5">
          {(["Alle", "VIP", "Guestlist"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150",
                filter === f
                  ? "border-accent-soft/60 bg-accent-dim text-accent"
                  : "border-ink-800 bg-ink-900 text-fg-muted hover:border-ink-700 hover:text-fg"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Liste */}
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {visible.map((guest) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              onCheckIn={() => checkInGuest(guest)}
              onCheckOut={() => checkOutGuest(guest)}
            />
          ))}
        </div>

        {!loading && visible.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              title={
                search
                  ? `Kein Treffer für „${search}“`
                  : "Noch keine Einträge"
              }
              hint={
                search
                  ? "Anderen Namen probieren oder Filter zurücksetzen."
                  : "Gäste werden im Admin Mode angelegt."
              }
            />
          </div>
        ) : null}

        {loading ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[152px] animate-pulse rounded-card border border-ink-800 bg-ink-900"
              />
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}
