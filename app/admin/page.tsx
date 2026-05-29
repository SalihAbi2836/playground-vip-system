"use client";
const ADMIN_PIN = "1907";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Guest = {
  id: number;
  name: string;
  allowedGuests: number;
  checkedIn: number;
  created_at: string;
  category: string;
};

export default function Home() {

    const [name, setName] = useState("");

  const [allowedGuests, setAllowedGuests] = useState(0);

  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [editName, setEditName] = useState("");

const [editGuests, setEditGuests] = useState(0);

const [guests, setGuests] = useState<Guest[]>([]);

  const [category, setCategory] =
  useState("Guestlist");

  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
  if (pin === ADMIN_PIN) {
    setIsAuthenticated(true);

    localStorage.setItem(
      "admin-auth",
      "true"
    );
  } else {
    alert("Wrong PIN");
  }
};
  useEffect(() => {
  const isAdmin =
    localStorage.getItem("admin-auth");

  if (isAdmin === "true") {
    setIsAuthenticated(true);
  }
}, []);

useEffect(() => {
  if (isAuthenticated) {
    fetchGuests();
  }
}, [isAuthenticated]);

useEffect(() => {
  const channel = supabase
    .channel("guests-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "guests",
      },
      () => {
        fetchGuests();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
  const fetchGuests = async () => {
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    if (data) {
      setGuests(data);
    }
  };

  const addGuest = async () => {
    if (!name.trim()) return;

    const { error } = await supabase.from("guests").insert([
      {
        name: name,
        allowedGuests: Number(allowedGuests),
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
    setAllowedGuests(0);
  };

  const checkInGuest = async (guest: Guest) => {
    if (guest.checkedIn >= guest.allowedGuests) return;

    const { error } = await supabase
      .from("guests")
      .update({
        checkedIn: guest.checkedIn + 1,
      })
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
      .update({
        checkedIn: guest.checkedIn - 1,
      })
      .eq("id", guest.id);

    if (error) {
      console.log(error);
      return;
    }

    fetchGuests();
  };

  const deleteGuest = async (id: number) => {
    const confirmed = window.confirm(
      "Willst du diesen VIP wirklich löschen?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("guests")
      .delete()
      .eq("id", id);

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
    .update({
      name: editName,
      allowedGuests: editGuests,
    })
    .eq("id", editingId);

  if (error) {
    console.log(error);
    return;
  }

  setEditingId(null);

  fetchGuests();
};
  const totalCheckedIn = guests.reduce(
    (sum, guest) => sum + guest.checkedIn,
    0
  );

  const totalAllowedGuests = guests.reduce(
    (sum, guest) => sum + guest.allowedGuests,
    0
  );
  const totalVIPs = guests.filter(
  (guest) => guest.category === "VIP"
).length;

const totalGuestlist = guests.filter(
  (guest) => guest.category === "Guestlist"
).length;
if (!isAuthenticated) {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
  <div className="bg-zinc-900 p-8 rounded-2xl w-80 text-center">
    <h1 className="text-3xl font-bold text-red-500 mb-4">
      Admin Login
    </h1>

    <input
      type="password"
      placeholder="PIN"
      value={pin}
      onChange={(e) => setPin(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleLogin();
        }
      }}
      className="w-full p-3 rounded-lg bg-zinc-800 text-white placeholder-gray-400 mb-4"
    />

    <button
      onClick={handleLogin}
      className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-lg font-bold"
    >
      Login
    </button>
  </div>
</main>
  );
}

  return (
    <main className="min-h-screen bg-black text-white p-5 md:p-10">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-red-500">
        Playground VIP System
      </h1>
<button
  onClick={() => {
    localStorage.removeItem("admin-auth");
    window.location.href = "/";
  }}
  className="mb-6 bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg font-bold"
>
  Zur Auswahl
</button>
      <div className="mb-8 flex flex-col md:flex-row gap-3 md:gap-6 text-lg md:text-xl">
  <p>
    VIPs:{" "}
    <span className="text-pink-400 font-bold">
      {totalVIPs}
    </span>
  </p>

  <p>
    Guestlist:{" "}
    <span className="text-orange-400 font-bold">
      {totalGuestlist}
    </span>
  </p>

  <p>
    Checked In:{" "}
    <span className="font-bold">
      {totalCheckedIn}
    </span>{" "}
    / {totalAllowedGuests}
  </p>
</div>

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <input
  className="p-3 rounded bg-white text-black"
  placeholder="VIP Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      addGuest();
    }
  }}
/>
<select
  value={category}
  onChange={(e) =>
    setCategory(e.target.value)
  }
  className="p-3 rounded bg-white text-black"
>
  <option value="Guestlist">
    Guestlist
  </option>

  <option value="VIP">
    VIP
  </option>
</select>
      <input
  className="p-3 rounded bg-white text-black md:w-32"
  type="number"
  placeholder="+Guests"
  value={allowedGuests}
  onChange={(e) =>
    setAllowedGuests(Number(e.target.value))
  }
/>

        <input
          type="text"
          placeholder="Search VIP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3 rounded bg-white text-black md:w-80"
        />

        <button
          onClick={addGuest}
          className="bg-red-600 hover:bg-red-700 transition px-6 py-3 rounded font-bold"
        >
          Add VIP
        </button>
      </div>

      <div className="space-y-5">
        {guests
  .filter((guest) =>
    guest.name
      .toLowerCase()
      .includes(search.toLowerCase())
  )
  .map((guest) => {
    const remaining =
      guest.allowedGuests - guest.checkedIn;

   const isFull =
  guest.allowedGuests > 0 &&
  remaining <= 0;

    return (
      <div
        key={guest.id}
       className={`p-6 rounded-2xl border transition ${
  isFull
    ? "bg-red-950 border-red-700"
    : guest.allowedGuests > 0 &&
      remaining <= 2
    ? "bg-amber-950 border-amber-700"
    : "bg-zinc-900 border-zinc-700"
}`}
      >
        {editingId === guest.id ? (
          <div className="flex flex-col gap-3">
            <input
              value={editName}
              onChange={(e) =>
                setEditName(e.target.value)
              }
              className="p-3 rounded bg-white text-black"
            />

            <input
              type="number"
              value={editGuests}
              onChange={(e) =>
                setEditGuests(
                  Number(e.target.value)
                )
              }
              className="p-3 rounded bg-white text-black"
            />

            <button
              onClick={saveEdit}
              className="bg-blue-600 hover:bg-blue-700 transition px-4 py-3 rounded-lg font-bold"
            >
              Save
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold">
              {guest.name}
            </h2>
<p
  className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-bold ${
    guest.category === "VIP"
      ? "bg-purple-700 text-white"
      : "bg-zinc-700 text-white"
  }`}
>
  {guest.category}
</p>

            <div className="mt-3 space-y-1">
              <p className="text-zinc-300">
                Allowed Guests:{" "}
                {guest.allowedGuests}
              </p>

              <p className="text-green-400 font-semibold">
                Checked In: {guest.checkedIn}
              </p>

              <p
                className={`font-semibold ${
                  isFull
                    ? "text-red-400"
                    : "text-yellow-400"
                }`}
              >
                Remaining: {remaining}
              </p>

              <p className="text-xs text-zinc-500 mt-2">
                Added:{" "}
                {new Date(
                  guest.created_at
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 mt-5">
              <button
                onClick={() =>
                  checkInGuest(guest)
                }
                disabled={isFull}
                className={`px-4 py-3 rounded-lg font-bold transition ${
                  isFull
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isFull
                  ? "Limit Reached"
                  : "+1 Check In"}
              </button>

              <button
                onClick={() =>
                  checkOutGuest(guest)
                }
                disabled={guest.checkedIn <= 0}
                className={`px-4 py-3 rounded-lg font-bold transition ${
                  guest.checkedIn <= 0
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-zinc-700 hover:bg-zinc-600"
                }`}
              >
                -1 Check Out
              </button>

              <button
                onClick={() =>
                  deleteGuest(guest.id)
                }
                className="bg-red-800 hover:bg-red-800 transition px-4 py-3 rounded-lg font-bold"
              >
                Delete VIP
              </button>

              <button
                onClick={() =>
                  startEdit(guest)
                }
                className="bg-blue-700 hover:bg-blue-800 transition px-4 py-3 rounded-lg font-bold"
              >
                Edit VIP
              </button>
            </div>
                </>
    )}
  </div>
);
  })}
    </div>
  </main>
);
}