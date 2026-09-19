"use client";

import { useState } from "react";
import styles from "./BookingCard.module.css";

export default function BookingCard() {
  const [activeTab, setActiveTab] = useState("outstation");

  return (
    <div className={styles.cardContainer}>
      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'outstation' ? styles.active : ''}`}
          onClick={() => setActiveTab('outstation')}
        >
          Outstation
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'local' ? styles.active : ''}`}
          onClick={() => setActiveTab('local')}
        >
          Local
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'airport' ? styles.active : ''}`}
          onClick={() => setActiveTab('airport')}
        >
          Airport
        </button>
      </div>

      {/* Form Content based on tab */}
      <div className={styles.formContainer}>
        {activeTab === 'outstation' && (
          <div className={styles.formRow}>
             <div className={styles.inputGroup}>
               <label>FROM</label>
               <input type="text" placeholder="Start typing city..." />
             </div>
             
             <button className={styles.swapBtn}>⇄</button>
             
             <div className={styles.inputGroup}>
               <label>TO</label>
               <input type="text" placeholder="Start typing city..." />
             </div>
             
             <div className={styles.inputGroup}>
               <label>PICKUP DATE</label>
               <input type="date" />
             </div>

             <div className={styles.inputGroup}>
               <label>PICKUP AT</label>
               <input type="time" defaultValue="09:00" />
             </div>

             <button className={`btn-primary ${styles.searchBtn}`}>Select Vehicle</button>
          </div>
        )}

        {activeTab === 'local' && (
          <div className={styles.formRow}>
             <div className={styles.inputGroup} style={{ flex: 2 }}>
               <label>CITY</label>
               <input type="text" placeholder="Start typing city..." />
             </div>
             
             <div className={styles.inputGroup}>
               <label>PICKUP DATE</label>
               <input type="date" />
             </div>

             <div className={styles.inputGroup}>
               <label>PICKUP AT</label>
               <input type="time" defaultValue="09:00" />
             </div>

             <button className={`btn-primary ${styles.searchBtn}`}>Select Vehicle</button>
          </div>
        )}

        {activeTab === 'airport' && (
          <div className={styles.formRow}>
             <div className={styles.inputGroup} style={{ flex: 2 }}>
               <label>CITY</label>
               <input type="text" placeholder="Start typing city..." />
             </div>
             
             <div className={styles.inputGroup}>
               <label>TRIP TYPE</label>
               <select>
                 <option>To the Airport</option>
                 <option>From the Airport</option>
               </select>
             </div>
             
             <div className={styles.inputGroup}>
               <label>PICKUP DATE</label>
               <input type="date" />
             </div>

             <button className={`btn-primary ${styles.searchBtn}`}>Select Vehicle</button>
          </div>
        )}
      </div>
    </div>
  );
}
