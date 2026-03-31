"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, MessageSquare, ChevronRight, Activity, Beaker, Scale, ShieldAlert, ArrowRight, MapPin } from 'lucide-react';
import styles from './page.module.css';

export default function ListingDetail() {
  const [bidAmount, setBidAmount] = useState('150');

  return (
    <main className="container">
      <div className={styles.pageHeader}>
        <span style={{color: '#0f172a', fontWeight: 600}}>GasUllaVidu</span>
        <ChevronRight size={14} />
        <span>Home</span>
        <ChevronRight size={14} />
        <Link href="/listings">Browse</Link>
        <ChevronRight size={14} />
        <span style={{color: 'var(--accent-primary)', fontWeight: 600}}>My Listings</span>
      </div>

      <div className={styles.layout}>
        {/* Left Column */}
        <div className={styles.leftCol}>
          
          <div className={styles.heroBox}>
            <span className={styles.heroTag}>VERIFIED CONDITION</span>
            <img src="/images/cylinder.png" alt="Gas Cylinder" className={styles.heroObj} />
          </div>

          <div className={styles.titleArea}>
            <div>
              <div style={{color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '1px'}}>
                INDANE • 14.2KG CYLINDER
              </div>
              <h1 className={styles.title}>Half-Full Backup<br />Cylinder</h1>
              <p className={styles.subtitle}>
                Owned for 6 months. Well maintained, kept indoors. Perfect for emergency backup during weekend shortages.
              </p>
            </div>
            <div style={{background: 'rgba(15, 76, 218, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <ShieldCheck size={24} /> Safe Exchange<br />Guaranteed
            </div>
          </div>

          <div className={styles.estimationSec}>
             <div className={styles.secTitle}>Gas Level Estimation</div>
             
             <div className={styles.estGrid}>
                <div className={styles.estCard}>
                  <Beaker color="var(--accent-primary)" size={28} />
                  <div className={styles.estValue}>45%</div>
                  <div className={styles.estLabel}>Water Test</div>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>Condensation line computed.</div>
                </div>
                
                <div className={styles.estCard}>
                  <Scale color="var(--success)" size={28} />
                  <div className={styles.estValue} style={{color: 'var(--success)'}}>22.4<span style={{fontSize: '1rem'}}>kg</span></div>
                  <div className={styles.estLabel}>Weight Check</div>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>Tare 15.3kg + Gas 7.1kg</div>
                </div>

                <div className={styles.estCard}>
                  <Activity color="var(--warning)" size={28} />
                  <div className={styles.estValue} style={{color: 'var(--warning)'}}>|||</div>
                  <div className={styles.estLabel}>Sound Echo</div>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>Low flag tone on resonance.</div>
                </div>
             </div>
          </div>

          <div className={styles.bottomGrid}>
             <div className={styles.estimationSec} style={{background: 'white'}}>
                <div className={styles.secTitle}>Pricing & Terms</div>
                <div>
                   <div className={styles.tableRow}>
                      <span style={{color: 'var(--text-secondary)'}}>Usage Fee (per day)</span>
                      <span style={{fontWeight: 600}}>₹150</span>
                   </div>
                   <div className={styles.tableRow}>
                      <span style={{color: 'var(--text-secondary)'}}>Refundable Deposit</span>
                      <span style={{fontWeight: 600}}>₹1,500</span>
                   </div>
                   <div className={styles.tableRow} style={{border: 'none', paddingBottom: 0}}>
                      <span style={{color: 'var(--text-secondary)'}}>Gas Cost (estimated)</span>
                      <span style={{fontWeight: 600}}>₹450</span>
                   </div>
                </div>
             </div>

             <div className={styles.estimationSec} style={{background: 'var(--bg-tertiary)'}}>
                <div className={styles.secTitle}>Safety & Location</div>
                <div>
                   <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem'}}>
                      <div style={{background: 'black', color: 'white', padding: '0.5rem', borderRadius: '50%'}}><MapPin size={20} /></div>
                      <div>
                        <div style={{fontWeight: 600}}>HSR Layout, Sector 2</div>
                        <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Available for pickup after 5 PM</div>
                      </div>
                   </div>
                   <div style={{background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.3)', padding: '1rem', borderRadius: '8px', color: '#c2410c'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '0.25rem'}}>
                         <ShieldAlert size={18} /> Safety Notice
                      </div>
                      <div style={{fontSize: '0.85rem'}}>Check for regulator seal validity before transport. Keep upright at all times.</div>
                   </div>
                </div>
             </div>
          </div>

        </div>

        {/* Right Column */}
        <div className={styles.rightCol}>
           
           <div className={styles.bidCard}>
              <h3 className={styles.bidHeader}>Live Bidding</h3>
              <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Current bids from local neighbors</p>

              <div className={styles.biddersList}>
                 <div className={`${styles.bidder} ${styles.top}`}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                       <div style={{width: 30, height: 30, background: 'var(--accent-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'}}>R</div>
                       Rahul V.
                    </div>
                    <div>₹180</div>
                 </div>
                 <div className={styles.bidder}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                       <div style={{width: 30, height: 30, background: '#cbd5e1', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'}}>S</div>
                       Savita M.
                    </div>
                    <div>₹150</div>
                 </div>
              </div>

              <div className={styles.bidInputGroup}>
                 <div style={{fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px'}}>Your Agency Bid</div>
                 <div style={{position: 'relative'}}>
                   <span style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--text-secondary)'}}>₹</span>
                   <input type="number" className={styles.bidInput} value={bidAmount} onChange={e => setBidAmount(e.target.value)} style={{paddingLeft: '2rem'}} />
                 </div>
              </div>

              <button className="btn btn-primary" style={{width: '100%', padding: '1rem', fontSize: '1rem', marginBottom: '1rem'}}>
                 Place a Bid
              </button>
              
              <button className="btn btn-secondary" style={{width: '100%', padding: '1rem', fontSize: '1rem'}}>
                 <MessageSquare size={18} /> Chat with Owner
              </button>

              <div style={{textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem'}}>
                Average response in 5 mins
              </div>
           </div>

           <div className={styles.userCard}>
              <div className={styles.avatar}>
                <span>K</span>
              </div>
              <div>
                 <div style={{fontWeight: 600}}>Karthik S.</div>
                 <div style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '2px'}}>
                    ⭐ 4.9 (12 shares)
                 </div>
              </div>
           </div>

        </div>
      </div>
    </main>
  );
}
