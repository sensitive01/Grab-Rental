import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <div className={styles.hero}>
      {/* 
        We use a premium gradient for the background to give a modern feel. 
        In a real app, this can be an optimized Image component.
      */}
      <div className={styles.overlay}></div>
      
      <div className={styles.content}>
        <h1 className={styles.title}>
          Rent A Ride,<br />
          <span className={styles.highlight}>Your Way.</span>
        </h1>
        <p className={styles.subtitle}>
          Premium Cars, Vans & Buses for Outstation, Local & Airport Transfers.
        </p>
      </div>
    </div>
  );
}
