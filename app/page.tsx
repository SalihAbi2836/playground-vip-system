import Link from "next/link";

export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#050505",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: 24,
      fontFamily: "Arial, sans-serif"
    }}>
      <div>
        <h1 style={{ color: "#ff1f2d", fontSize: 42 }}>
          Playground VIP System
        </h1>

        <p style={{ opacity: 0.8, marginBottom: 32 }}>
          Authorized access only.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <Link href="/door">
            <button>Door Login</button>
          </Link>

          <Link href="/admin">
            <button>Admin Login</button>
          </Link>
        </div>
      </div>
    </main>
  );
}