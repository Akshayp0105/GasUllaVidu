"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Grid, Flame, Target, MessageSquare } from 'lucide-react';
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
}

const listingsData: Listing[] = [
  { id: '1', brand: 'Indane', weight: '14.2kg', condition: 'Factory Sealed', level: 100, levelMethod: 'Weight Test', price: 1050, delivery: 'Home Delivery' },
  { id: '2', brand: 'Bharat', weight: '14.2kg', condition: 'Used (Open)', level: 45, levelMethod: 'Water Test', price: 650, delivery: 'Pickup Only' },
  { id: '3', brand: 'HP', weight: '19kg', condition: 'Factory Sealed', level: 100, levelMethod: 'Weight Test', price: 1800, delivery: 'Meeting Point' },
  { id: '4', brand: 'Indane', weight: '5kg', condition: 'Used', level: 20, levelMethod: 'Estimation', price: 350, delivery: 'Pickup' },
];

export default function ListingsPage() {
  const [filter, setFilter] = useState('All Brands');

  return (
    <div className={styles.pageContainer}>
      <aside className={styles.sidebar}>
        <div style={{color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, paddingLeft: '1rem'}}>MAIN MENU</div>
        <Link href="/" key="home" className={styles.sidebarItem}>
           <Grid size={20} /> Home
        </Link>
        <div className={`${styles.sidebarItem} ${styles.active}`}>
           <Search size={20} /> Browse
        </div>
        <div className={styles.sidebarItem}>
           <Target size={20} /> My Listings
        </div>
        <div className={styles.sidebarItem}>
           <MessageSquare size={20} /> Chat
        </div>
        <div className={styles.sidebarItem} style={{marginTop: 'auto', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px'}}>
           <Flame color="var(--accent-primary)" size={20} /> AI Assistant
        </div>
      </aside>

      <main className={styles.mainLayout}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <div className={styles.searchBar}>
              <Search size={18} color="var(--text-muted)" />
              <input type="text" placeholder="Search by locality or city..." className={styles.searchInput} />
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500}}>
              <MapPin size={18} color="var(--accent-primary)" /> Chennai, TN
            </div>
          </div>

          <div style={{fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1rem'}}>
            NEARBY LISTINGS (12)
          </div>

          <div className={styles.filters}>
            {['All Brands', 'Indane', 'HP Gas', 'Bharat'].map(f => (
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
            {listingsData.filter(item => filter === 'All Brands' || item.brand === filter.split(' ')[0]).map(listing => (
              <Link href={`/listings/${listing.id}`} key={listing.id}>
                <div className={styles.card}>
                  <div className={styles.cardLeft}>
                    <div className={`${styles.brandIcon} ${styles[listing.brand]}`}>
                      {listing.brand[0]}
                    </div>
                    <div>
                      <div className={styles.cardInfo}>
                        <h3>{listing.brand} Gas {listing.weight}</h3>
                      </div>
                      <div className={styles.cardTags}>
                        <div className={`badge ${listing.level === 100 ? 'badge-success' : 'badge-warning'}`}>
                          {listing.condition}
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                          <MapPin size={14} /> 1.2 Km Away
                        </div>
                      </div>
                      <div className={styles.levelBarContainer}>
                        <div className={styles.levelHeader}>
                          <span>Volume</span>
                          <span style={{color: listing.level === 100 ? 'var(--success)' : 'var(--warning)'}}>{listing.level}%</span>
                        </div>
                        <div className={styles.levelBar}>
                          <div className={styles.levelFill} style={{width: `${listing.level}%`, background: listing.level === 100 ? 'var(--success)' : 'var(--warning)'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <div className={styles.price}>
                      ₹{listing.price} <span>/ cylinder</span>
                    </div>
                    <button className="btn btn-secondary">Chat Now</button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.mapArea}>
          <img src="/images/map.png" alt="Heatmap showing available cylinders" className={styles.mapImage} />
          <div className={styles.mapOverlay}>
            <div style={{width: 8, height: 8, background: 'var(--accent-primary)', borderRadius: '50%'}}></div>
            Safe work coverage
          </div>
        </div>
      </main>
    </div>
  );
}
