"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, LayoutDashboard, Flame, Target, MessageSquare, ChevronRight } from 'lucide-react';
import styles from './page.module.css';

interface Listing {
  id: string;
  brand: 'Indane' | 'HP' | 'Bharat';
  weight: string;
  condition: string;
  level: number;
  levelMethod: string;
  price: number;
  delivery: string;
  distance: string;
}

const listingsData: Listing[] = [
  { id: '1', brand: 'Indane', weight: '14.2kg', condition: 'Factory Sealed', level: 100, levelMethod: 'Weight Test', price: 1050, delivery: 'Home Delivery', distance: '1.2' },
  { id: '2', brand: 'Bharat', weight: '14.2kg', condition: 'Used (Open)', level: 45, levelMethod: 'Water Test', price: 450, delivery: 'Pickup Only', distance: '2.5' },
  { id: '3', brand: 'HP', weight: '19kg', condition: 'Factory Sealed', level: 100, levelMethod: 'Weight Test', price: 1800, delivery: 'Meeting Point', distance: '0.8' },
  { id: '4', brand: 'Indane', weight: '5kg', condition: 'Used', level: 20, levelMethod: 'Estimation', price: 350, delivery: 'Pickup', distance: '3.1' },
];

export default function ListingsPage() {
  const [filter, setFilter] = useState('All Brands');

  const filteredListings = listingsData.filter(item => 
    filter === 'All Brands' || item.brand === filter.split(' ')[0]
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
            <AnimatePresence>
               {filteredListings.map((listing, i) => (
                 <motion.div
                   key={listing.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ duration: 0.3, delay: i * 0.05 }}
                 >
                   <Link href={`/listings/${listing.id}`} className={styles.card}>
                     <div className={styles.cardLeft}>
                       <div className={`${styles.brandIcon} ${styles[listing.brand]}`}>
                         {listing.brand[0]}
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
               ))}
               {filteredListings.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{padding: '4rem', textAlign: 'center', color: 'var(--text-muted)'}}>
                     No listings found for this brand in your radius.
                  </motion.div>
               )}
            </AnimatePresence>
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
