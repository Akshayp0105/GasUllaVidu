"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ShieldCheck, MessageSquare, ChevronRight, Activity, Beaker, Scale, ShieldAlert, ArrowRight, MapPin, Loader2, ChevronLeft } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import styles from './page.module.css';

interface Listing {
  id: string;
  brand: string;
  weight: string;
  condition: string;
  level: number;
  levelMethod?: string;
  price: number;
  delivery: string;
  distance: string;
  userName?: string;
  userId?: string;
  description?: string;
  locationName?: string;
}

export default function ListingDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('150');

  useEffect(() => {
    async function fetchListing() {
      if (!id) return;
      try {
        const docRef = doc(db, 'listings', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setListing({ id: docSnap.id, ...docSnap.data() } as Listing);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading listing details...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Listing Not Found</h2>
        <button className="btn btn-primary" onClick={() => router.push('/listings')}>Back to Inventory</button>
      </div>
    );
  }

  const brandName = listing.brand.toUpperCase();
  const brandClass = listing.brand.includes('Indane') ? 'Indane' : listing.brand.includes('HP') ? 'HP' : 'Bharat';

  return (
    <main className="container">
      <div className={styles.pageHeader}>
        <button onClick={() => router.back()} style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
           <ChevronLeft size={16} /> Back
        </button>
        <ChevronRight size={14} />
        <Link href="/listings">Inventory</Link>
        <ChevronRight size={14} />
        <span style={{color: 'var(--accent-primary)', fontWeight: 600}}>{brandName}</span>
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
                {brandName} • {listing.weight} CYLINDER
              </div>
              <h1 className={styles.title}>{listing.condition} Cylinder<br />for Sharing</h1>
              <p className={styles.subtitle}>
                {listing.description || `This ${brandName} cylinder is available for immediate pick-up. Handled with care and verified by the community.`}
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
                  <div className={styles.estValue}>{listing.level}%</div>
                  <div className={styles.estLabel}>Level Status</div>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>Reported by owner during listing.</div>
                </div>
                
                <div className={styles.estCard}>
                  <Scale color="var(--success)" size={28} />
                  <div className={styles.estValue} style={{color: 'var(--success)'}}>{listing.weight}</div>
                  <div className={styles.estLabel}>Cylinder Size</div>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>Standard domestic/commercial size.</div>
                </div>

                <div className={styles.estCard}>
                  <Activity color="var(--warning)" size={28} />
                  <div className={styles.estValue} style={{color: 'var(--warning)'}}>{listing.condition === 'Factory Sealed' ? 'SEALED' : 'OPEN'}</div>
                  <div className={styles.estLabel}>Seal Status</div>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>Physical verification recommended.</div>
                </div>
             </div>
          </div>

          <div className={styles.bottomGrid}>
             <div className={styles.estimationSec} style={{background: 'white'}}>
                <div className={styles.secTitle}>Pricing & Terms</div>
                <div>
                   <div className={styles.tableRow}>
                      <span style={{color: 'var(--text-secondary)'}}>Unit Price</span>
                      <span style={{fontWeight: 600}}>₹{listing.price}</span>
                   </div>
                   <div className={styles.tableRow}>
                      <span style={{color: 'var(--text-secondary)'}}>Delivery Mode</span>
                      <span style={{fontWeight: 600}}>{listing.delivery}</span>
                   </div>
                   <div className={styles.tableRow} style={{border: 'none', paddingBottom: 0}}>
                      <span style={{color: 'var(--text-secondary)'}}>Community Trust Factor</span>
                      <span style={{fontWeight: 600}}>High</span>
                   </div>
                </div>
             </div>

             <div className={styles.estimationSec} style={{background: 'var(--bg-tertiary)'}}>
                <div className={styles.secTitle}>Safety & Location</div>
                <div>
                   <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem'}}>
                      <div style={{background: 'black', color: 'white', padding: '0.5rem', borderRadius: '50%'}}><MapPin size={20} /></div>
                      <div>
                        <div style={{fontWeight: 600}}>{listing.locationName || 'Chennai South, TN'}</div>
                        <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{listing.distance} Km from your area</div>
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
              <h3 className={styles.bidHeader}>Community Bidding</h3>
              <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Current interest from neighbors</p>

              <div className={styles.biddersList}>
                 <div className={`${styles.bidder} ${styles.top}`}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                       <div style={{width: 30, height: 30, background: 'var(--accent-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'}}>R</div>
                       Rahul V.
                    </div>
                    <div>₹{listing.price + 50}</div>
                 </div>
                 <div className={styles.bidder}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                       <div style={{width: 30, height: 30, background: '#cbd5e1', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'}}>S</div>
                       Savita M.
                    </div>
                    <div>₹{listing.price}</div>
                 </div>
              </div>

              <div className={styles.bidInputGroup}>
                 <div style={{fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px'}}>Request Offer</div>
                 <div style={{position: 'relative'}}>
                   <span style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--text-secondary)'}}>₹</span>
                   <input type="number" className={styles.bidInput} value={bidAmount} onChange={e => setBidAmount(e.target.value)} style={{paddingLeft: '2rem'}} />
                 </div>
              </div>

              <button className="btn btn-primary" style={{width: '100%', padding: '1rem', fontSize: '1rem', marginBottom: '1rem'}} onClick={() => alert("Interest recorded. Owner will be notified.")}>
                 Submit Offer
              </button>
              
              <button className="btn btn-secondary" style={{width: '100%', padding: '1rem', fontSize: '1rem'}} onClick={() => alert("Chat initialized.")}>
                 <MessageSquare size={18} /> Chat with Owner
              </button>

              <div style={{textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem'}}>
                Average response in 5 mins
              </div>
           </div>

           <div className={styles.userCard}>
              <div className={styles.avatar}>
                <span>{listing.userName?.[0] || 'A'}</span>
              </div>
              <div>
                 <div style={{fontWeight: 600}}>{listing.userName || 'Anonymous Owner'}</div>
                 <div style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '2px'}}>
                    ⭐ 4.9 (Trusted Sharer)
                 </div>
              </div>
           </div>

        </div>
      </div>
    </main>
  );
}
