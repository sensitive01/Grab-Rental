import Navbar from "@/components/Navbar/Navbar";

export default function OperationsPortal() {
  return (
    <main>
      <Navbar />
      <div className="container" style={{ minHeight: "60vh", padding: "80px 16px" }}>
        <h1>Operations Portal</h1>
        <p style={{ marginTop: "16px", color: "var(--text-muted)" }}>
          Manage day-to-day trips, assign drivers, and handle customer queries.
        </p>
        {/* Further implementation in Phase 4 */}
      </div>
    </main>
  );
}
