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
        <p style={{ fontSize: 18, opacity: 0.8 }}>
          Authorized access only.
        </p>
      </div>
    </main>
  );
}