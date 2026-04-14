/* eslint-disable */
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, LayoutDashboard, Flame, Target, MessageSquare, ChevronRight, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase/client';
import { subscribeToListings, type ListingView } from '@/lib/firebase/listings';
import ListingsPageClient from './ListingsPageClient';
import styles from './page.module.css';

export function LegacyListingsPage() {
  const [filter, setFilter] = useState('All Brands');
  const [listings, setListings] = useState<ListingView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToListings(
      db,
      (nextListings) => {
        setListings(nextListings);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading listings:', error);
        setListings([]);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const filteredListings = listings.filter(
    (item) => filter === 'All Brands' || item.brand.includes(filter.split(' ')[0]),
  );

  return (
    <div className={styles.pageContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTitle}>Main Menu</div>
        <Link href="/dashboard" className={styles.sidebarItem}>
           <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link href="/listings" className={`${styles.sidebarItem} ${styles.active}`}>
           <Search size={20} /> Browse Inventory
        </Link>
        <Link href="/dashboard" className={styles.sidebarItem}>
           <Target size={20} /> My Listings
        </Link>
        <Link href="/dashboard" className={styles.sidebarItem}>
           <MessageSquare size={20} /> Encrypted Chat
        </Link>
        <Link href="#" className={`${styles.sidebarItem} ${styles.aiAssistant}`}>
           <Flame color="var(--accent-primary)" size={20} /> Ask AI Assistant
        </Link>
      </aside>

      <main className={styles.mainLayout}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <div className={styles.searchBar}>
              <Search size={20} color="var(--text-muted)" />
              <input type="text" placeholder="Search by locality, city, or pincode..." className={styles.searchInput} />
            </div>
            <div className={styles.locationBadge}>
              <MapPin size={18} color="var(--accent-primary)" /> Chennai, TN
            </div>
          </div>

          <div className={styles.sectionHeader}>
            LIVE LOCAL INVENTORY ({filteredListings.length})
          </div>

          <div className={styles.filters}>
            {['All Brands', 'Indane (IOCL)', 'HP Gas', 'Bharat Gas'].map(f => (
              <button 
                key={f} 
                className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className={styles.list}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
              </div>
            ) : (
              <AnimatePresence>
                 {filteredListings.map((listing, i) => {
                   const brandClass = listing.brand.includes('Indane') ? 'Indane' : listing.brand.includes('HP') ? 'HP' : 'Bharat';
                   return (
                     <motion.div
                       key={listing.id}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       transition={{ duration: 0.3, delay: i * 0.05 }}
                     >
                       <Link href={`/listings/${listing.id}`} className={styles.card}>
                         <div className={styles.cardLeft}>
                           <div className={`${styles.brandIcon} ${styles[brandClass]}`}>
                             {brandClass[0]}
                           </div>
                           <div>
                             <div className={styles.cardInfo}>
                               <h3>{listing.brand} Supply • {listing.weight}</h3>
                             </div>
                             <div className={styles.cardTags}>
                               <span className={`badge ${listing.level === 100 ? 'badge-success' : 'badge-warning'}`}>
                                 {listing.condition}
                               </span>
                               <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                                 <MapPin size={14} /> {listing.distance} Km Away
                               </span>
                             </div>
                             <div className={styles.levelBarContainer}>
                               <div className={styles.levelHeader}>
                                 <span>Remaining Volume</span>
                                 <span style={{color: listing.level === 100 ? 'var(--success)' : 'var(--warning)'}}>{listing.level}%</span>
                               </div>
                               <div className={styles.levelBar}>
                                 <div 
                                   className={styles.levelFill} 
                                   style={{width: `${listing.level}%`, background: listing.level === 100 ? 'var(--success)' : 'var(--warning)'}}
                                 />
                               </div>
                             </div>
                           </div>
                         </div>
                         <div className={styles.cardRight}>
                           <div className={styles.price}>
                             ₹{listing.price} <span>/ unit</span>
                           </div>
                           <div className="btn btn-primary" style={{padding: '0.625rem 1.25rem', borderRadius: '10px'}}>
                             View Details <ChevronRight size={16} />
                           </div>
                         </div>
                       </Link>
                     </motion.div>
                   );
                 })}
                 {filteredListings.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{padding: '4rem', textAlign: 'center', color: 'var(--text-muted)'}}>
                       No listings found for this brand in your radius.
                    </motion.div>
                 )}
              </AnimatePresence>
            )}
          </div>
        </div>

        <div className={styles.mapArea}>
          <img src="/images/map.png" alt="Heatmap showing available cylinders" className={styles.mapImage} />
          <div className={styles.mapOverlay}>
            <div style={{width: 8, height: 8, background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 10px rgba(16,185,129,0.8)'}}></div>
            Radar Active
          </div>
        </div>
      </main>
    </div>
  );
}

export default ListingsPageClient;
