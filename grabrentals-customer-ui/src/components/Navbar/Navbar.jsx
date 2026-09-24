import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.logo}>
          <Link href="/">
            <span style={{ color: "var(--primary-color)", fontWeight: "bold", fontSize: "28px" }}>Grab</span>
            <span style={{ color: "var(--secondary-color)", fontWeight: "bold", fontSize: "28px" }}>Rentals</span>
          </Link>
        </div>
        
        <div className={styles.links}>
          <Link href="/ops" className={styles.navLink}>Operations</Link>
          <Link href="/agency" className={styles.navLink}>Partner with Us</Link>
          <Link href="/admin" className={styles.navLink}>Admin</Link>
          <a href="tel:9045450000" className={styles.contactBtn}>
             📞 24/7 Helpline
          </a>
          <Link href="/dashboard" className="btn-primary" style={{ padding: "8px 20px" }}>
            Login / Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
