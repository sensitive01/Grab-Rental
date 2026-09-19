import Navbar from "@/components/Navbar/Navbar";

export default function AgencyPortal() {
  return (
    <main>
      <Navbar />
      <div className="container" style={{ minHeight: "60vh", padding: "80px 16px" }}>
        <h1>Partner With Us (Agency / Fleet Owner Portal)</h1>
        <p style={{ marginTop: "16px", color: "var(--text-muted)" }}>
          Attach your cars, vans, or buses with Grab Rentals and start earning. Manage your fleet and trips here.
        </p>
        {/* Further implementation in Phase 4 */}
      </div>
    </main>
  );
}
