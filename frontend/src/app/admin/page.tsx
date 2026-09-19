import Navbar from "@/components/Navbar/Navbar";

export default function AdminPortal() {
  return (
    <main>
      <Navbar />
      <div className="container" style={{ minHeight: "60vh", padding: "80px 16px" }}>
        <h1>Super Admin Portal</h1>
        <p style={{ marginTop: "16px", color: "var(--text-muted)" }}>
          Manage all users, agencies, bookings, and system configurations.
        </p>
        {/* Further implementation in Phase 4 */}
      </div>
    </main>
  );
}
