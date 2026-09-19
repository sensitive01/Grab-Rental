import Navbar from "@/components/Navbar/Navbar";

export default function Dashboard() {
  return (
    <main>
      <Navbar />
      <div className="container" style={{ minHeight: "60vh", padding: "80px 16px" }}>
        <h1>Customer Dashboard</h1>
        <p style={{ marginTop: "16px", color: "var(--text-muted)" }}>
          Welcome back! Here you can view your past bookings, manage your profile, and start new trips.
        </p>
        {/* Further implementation in Phase 3 */}
      </div>
    </main>
  );
}
