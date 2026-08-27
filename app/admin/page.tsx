"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { AppHeader } from "../components/AppHeader";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { GuestCard, Guest } from "../components/GuestCard";
import { PinScreen } from "../components/PinScreen";
import {
  Button,
  EmptyState,
  Input,
  SearchInput,
  Stat,
  cn,
} from "../components/ui";

const ADMIN_PIN = "1907";

export default function AdminPage() {
  const [name, setName] = useState("");
  const [allowedGuests, setAllowedGuests] = useState<string>("");
  const [category, setCategory] = useState("Guestlist");
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editGuests, setEditGuests] = useState(0);

  const [pendingDelete, setPendingDelete] = useState<Guest | null>(null);

  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Auth-Status liegt in localStorage, also erst nach dem Mount lesbar —
    // deshalb bewusst im Effect. `ready` verhindert Hydration-Mismatch.
    if (localStorage.getItem("admin-auth") === "true") {
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
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchGuests();
    }
  }, [isAuthenticated, fetchGuests]);

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

  const addGuest = async () => {
    if (!name.trim()) return;

    const { error } = await supabase.from("guests").insert([
      {
        name: name.trim(),
        allowedGuests: Number(allowedGuests) || 0,
        checkedIn: 0,
        category: category,
      },
    ]);

    if (error) {
      console.log(error);
      return;
    }

    fetchGuests();
    setName("");
    setAllowedGuests("");
  };

  const checkInGuest = async (guest: Guest) => {
    if (guest.checkedIn >= guest.allowedGuests) return;

    const { error } = await supabase
      .from("guests")
      .update({ checkedIn: guest.checkedIn + 1 })
      .eq("id", guest.id);

    if (error) {
      console.log(error);
      return;
    }

    fetchGuests();
  };

  const checkOutGuest = async (guest: Guest) => {
    if (guest.checkedIn <= 0) return;

    const { error } = await supabase
      .from("guests")
      .update({ checkedIn: guest.checkedIn - 1 })
      .eq("id", guest.id);

    if (error) {
      console.log(error);
      return;
    }

    fetchGuests();
  };

  const deleteGuest = async (id: number) => {
    const { error } = await supabase.from("guests").delete().eq("id", id);

    if (error) {
      console.log(error);
      return;
    }

    fetchGuests();
  };

  const startEdit = (guest: Guest) => {
    setEditingId(guest.id);
    setEditName(guest.name);
    setEditGuests(guest.allowedGuests);
  };

  const saveEdit = async () => {
    const { error } = await supabase
      .from("guests")
      .update({ name: editName, allowedGuests: editGuests })
      .eq("id", editingId);

    if (error) {
      console.log(error);
      return;
    }

    setEditingId(null);
    fetchGuests();
  };

  const totalCheckedIn = guests.reduce((sum, g) => sum + g.checkedIn, 0);
  const totalAllowedGuests = guests.reduce((sum, g) => sum + g.allowedGuests, 0);
  const totalVIPs = guests.filter((g) => g.category === "VIP").length;
  const totalGuestlist = guests.filter((g) => g.category === "Guestlist").length;

  const visible = guests.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!ready) {
    return <main className="min-h-screen bg-ink-950" />;
  }

  if (!isAuthenticated) {
    return (
      <PinScreen
        title="Admin Mode"
        subtitle="PIN eingeben, um die Gästeliste zu verwalten"
        expectedPin={ADMIN_PIN}
        onSuccess={() => {
          localStorage.setItem("admin-auth", "true");
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader
        mode="Admin Mode"
        onExit={() => {
          localStorage.removeItem("admin-auth");
          window.location.href = "/";
        }}
      />

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

        {/* Eintrag hinzufügen */}
        <section className="mt-6 rounded-card border border-ink-800 bg-ink-900 p-4 md:p-5">
          <h2 className="text-[11px] uppercase tracking-[0.18em] text-fg-faint">
            Eintrag hinzufügen
          </h2>

          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addGuest();
              }}
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-control border border-ink-700 bg-ink-850 px-3.5 py-2.5
                         text-sm text-fg transition-colors hover:border-ink-600
                         focus:border-accent-soft md:w-36"
            >
              <option value="Guestlist">Gästeliste</option>
              <option value="VIP">VIP</option>
            </select>

            <Input
              type="number"
              min={0}
              placeholder="Plätze"
              value={allowedGuests}
              onChange={(e) => setAllowedGuests(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addGuest();
              }}
              className="md:w-28"
            />

            <Button
              variant="primary"
              onClick={addGuest}
              disabled={!name.trim()}
              className="md:w-32"
            >
              Hinzufügen
            </Button>
          </div>
        </section>

        {/* Suche */}
        <div className="mt-6">
          <SearchInput
            type="text"
            placeholder="Namen suchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:max-w-sm"
          />
        </div>

        {/* Liste */}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {visible.map((guest) =>
            editingId === guest.id ? (
              <div
                key={guest.id}
                className="rounded-card border border-accent-soft/50 bg-ink-900 p-4"
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-accent">
                  Bearbeiten
                </p>

                <div className="mt-3 space-y-3">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Name"
                    autoFocus
                  />
                  <Input
                    type="number"
                    min={0}
                    value={editGuests}
                    onChange={(e) => setEditGuests(Number(e.target.value))}
                    placeholder="Plätze"
                  />
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="primary" onClick={saveEdit}>
                    Speichern
                  </Button>
                  <Button variant="ghost" onClick={() => setEditingId(null)}>
                    Abbrechen
                  </Button>
                </div>
              </div>
            ) : (
              <GuestCard
                key={guest.id}
                guest={guest}
                showAddedTime
                onCheckIn={() => checkInGuest(guest)}
                onCheckOut={() => checkOutGuest(guest)}
                footer={
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => startEdit(guest)}>
                      Bearbeiten
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setPendingDelete(guest)}
                    >
                      Löschen
                    </Button>
                  </div>
                }
              />
            )
          )}
        </div>

        {!loading && visible.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title={
                search ? `Kein Treffer für „${search}“` : "Noch keine Einträge"
              }
              hint={
                search
                  ? "Anderen Namen probieren."
                  : "Oben einen Namen eintragen, um zu starten."
              }
            />
          </div>
        ) : null}

        {loading ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-[214px] animate-pulse rounded-card",
                  "border border-ink-800 bg-ink-900"
                )}
              />
            ))}
          </div>
        ) : null}
      </main>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Eintrag löschen?"
        message={
          pendingDelete
            ? `„${pendingDelete.name}“ wird endgültig aus der Liste entfernt.`
            : ""
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteGuest(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
