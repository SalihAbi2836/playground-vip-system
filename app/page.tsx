import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-red-500 mb-4">
          Playground VIP System
        </h1>

        <p className="text-zinc-400 mb-8">
          Authorized access only.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href="/door"
            className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl font-bold"
          >
           Door Mode
Check In / Check Out

          </Link>

          <Link
            href="/admin"
            className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-bold"
          >
            Admin Mode
Manage VIPs & Guests

          </Link>
        </div>
      </div>
    </main>
  );
}