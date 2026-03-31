"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, Zap, Search, BookOpen, MapPin, MessageCircle } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, damping: 20 } 
    }
  } as const;

  return (
    <main className={styles.main}>
      <div className={styles.bgPattern}></div>

      {/* Hero Section */}
      <section className={styles.hero}>
        <motion.div 
          className={styles.heroContent}
          initial="hidden" animate="show" variants={containerVariants}
        >
          <motion.div variants={itemVariants} className={styles.heroTag}>
             <span style={{width: 8, height: 8, background: 'var(--accent-primary)', borderRadius: '50%', boxShadow: '0 0 12px var(--accent-glow)'}}></span>
             LPG HYPERLOCAL EXCHANGE
          </motion.div>
          
          <motion.h1 variants={itemVariants} className={styles.heroTitle}>
            Fueling Local <br /> <span>Trust</span> Through <br /> Community
          </motion.h1>
          
          <motion.p variants={itemVariants} className={styles.heroSubtitle}>
            The first secure P2P network for LPG sharing. Connect with verified neighbors, place smart bids, and ensure energy security with AI-driven safety protocols.
          </motion.p>
          
          <motion.div variants={itemVariants} className={styles.searchWidget}>
            <Search color="var(--text-muted)" size={20} />
            <input 
              type="text" 
              placeholder="Enter your locality or brand..." 
              className={styles.searchInput}
            />
            <Link href="/listings" className="btn btn-primary">
              Find Supply
            </Link>
          </motion.div>
        </motion.div>

        {/* Dynamic Animated Living Visual */}
        <motion.div 
          className={styles.livingVisual}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className={styles.backdropCircle}></div>
          
          {/* Main Floating Dashboard Element */}
          <div className={styles.centerDevice}>
             <div className={styles.deviceHeader}>
                <div className={styles.macDots}>
                   <div style={{background: '#ef4444'}}></div>
                   <div style={{background: '#f59e0b'}}></div>
                   <div style={{background: '#10b981'}}></div>
                </div>
                <div className={styles.headerTitle}>Live Network Radar</div>
             </div>
             
             <div className={styles.deviceMap}>
                <div className={styles.deviceMapOverlay}></div>
                <div className={styles.radarSweep}></div>
                
                {/* Central Focus (Cylinder Overlay) */}
                <div className={styles.centerCylinderFocus}>
                   <div className={styles.cylinderBox}>
                      <img src="/images/cylinder.png" alt="Cylinder" className={styles.cylinderImg} />
                      <div className={styles.cylinderBadge}>Available Now</div>
                   </div>
                </div>
             </div>
          </div>

          {/* Floating UI Widget 1: Map Pin */}
          <div className={`${styles.floatingCard} ${styles.topRight}`}>
            <div className={styles.cardIcon} style={{background: 'rgba(15, 76, 218, 0.08)', color: 'var(--accent-primary)'}}>
              <MapPin size={24} />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.cardTitle}>1.2 KM Away</div>
              <div className={styles.cardSub}>Indane 14.2kg</div>
            </div>
          </div>

          {/* Floating UI Widget 2: New Bid */}
          <div className={`${styles.floatingCard} ${styles.midLeft}`}>
            <div className={styles.cardIcon} style={{background: 'rgba(16, 185, 129, 0.08)', color: 'var(--success)'}}>
              <Target size={24} />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.cardTitle}>Bid Placed: ₹180</div>
              <div className={styles.cardSub}>By Verified User</div>
            </div>
          </div>

          {/* Floating UI Widget 3: Chat */}
          <div className={`${styles.floatingCard} ${styles.bottomRight}`}>
            <div className={styles.cardIcon} style={{background: 'rgba(249, 115, 22, 0.08)', color: '#f97316'}}>
              <MessageCircle size={24} />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.cardTitle}>Chat Message</div>
              <div className={styles.cardSub}>I can pick it up at 5 PM.</div>
            </div>
          </div>

        </motion.div>
      </section>

      {/* Editorial Safeguard Section */}
      <section className={styles.editorial}>
        <div style={{maxWidth: '1300px', margin: '0 auto'}}>
          <div style={{textAlign: 'center', marginBottom: '2rem'}}>
             <span className={styles.sectionTag} style={{margin: '0 auto 1rem'}}>Core Tenets</span>
             <h2 className={styles.sectionTitle}>The Editorial Safeguard</h2>
          </div>
          
          <div className={styles.editorialGrid}>
            <motion.div 
              className={styles.editorialCard}
              whileHover={{ y: -8 }}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}
            >
              <div className={`${styles.iconWrap} ${styles.blue}`}><ShieldCheck size={32} /></div>
              <h3>Community Trust</h3>
              <p>Every member is verified through local community vouchers. Trade with confidence among neighbors you know and rely on in emergencies.</p>
            </motion.div>
            
            <motion.div 
              className={styles.editorialCard}
              whileHover={{ y: -8 }}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{delay: 0.15}}
            >
              <div className={`${styles.iconWrap} ${styles.green}`}><BookOpen size={32} /></div>
              <h3>Safety Guides</h3>
              <p>Detailed checklist for pickup and transportation. We prioritize safety protocols over everything else, equipped with AI checking mechanisms.</p>
            </motion.div>

            <motion.div 
              className={styles.editorialCard}
              whileHover={{ y: -8 }}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{delay: 0.3}}
            >
              <div className={`${styles.iconWrap} ${styles.orange}`}><Zap size={32} /></div>
              <h3>Fast Bidding</h3>
              <p>Our real-time bidding engine ensures fair pricing based on hyperlocal demand and supply availability when time is critical for cooking meals.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className={styles.steps}>
        <div className={styles.stepsHeader}>
          <span className={styles.sectionTag} style={{margin: '0 auto 1rem', display: 'table'}}>How it works</span>
          <h2 className={styles.sectionTitle} style={{marginBottom: '1.5rem'}}>Simple Steps to Secure Supply</h2>
          <p style={{color: '#475569', maxWidth: '600px', margin: '0 auto', fontSize: '1.25rem'}}>We've streamlined the exchange process to be as fast as a text message and as secure as a bank vault.</p>
        </div>

        <motion.div className={styles.stepRow} initial={{opacity: 0, x: -25}} whileInView={{opacity: 1, x: 0}} viewport={{once: true}}>
          <div className={styles.stepNumber}>01</div>
          <div className={styles.stepContent}>
            <h3>Search Nearby</h3>
            <p>Use our map-integrated search to find neighbors with available cylinders. Filter by weight, brand, and proximity immediately.</p>
          </div>
          <div className={styles.stepImage}>
            <img src="/images/map.png" alt="Heatmap Search" />
          </div>
        </motion.div>

        <motion.div className={styles.stepRow} initial={{opacity: 0, x: 25}} whileInView={{opacity: 1, x: 0}} viewport={{once: true}}>
          <div className={styles.stepNumber}>02</div>
          <div className={styles.stepContent}>
            <h3>Bid & Chat</h3>
            <p>Place a competitive bid or accept a fixed price. Use our secure in-app chat to finalize pickup details without sharing personal numbers.</p>
          </div>
          <div className={styles.stepImage}>
             {/* Abstract simulated chat visual */}
             <div style={{width:'100%', height:'100%', background:'#f8fafc', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                <div style={{boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', background: 'white', padding: '1.25rem', borderRadius: '16px 16px 16px 0', border: '1px solid rgba(226, 232, 240, 0.8)', width: '75%', alignSelf: 'flex-start', fontSize: '1.1rem'}}>Hi! Is the cylinder available right now?</div>
                <div style={{boxShadow: '0 10px 15px -3px rgba(15, 76, 218, 0.1)', background: 'var(--accent-primary)', color: 'white', padding: '1.25rem', borderRadius: '16px 16px 0 16px', width: '75%', alignSelf: 'flex-end', fontSize: '1.1rem'}}>Yes, it is! You can pick it up.</div>
             </div>
          </div>
        </motion.div>

        <motion.div className={styles.stepRow} initial={{opacity: 0, x: -25}} whileInView={{opacity: 1, x: 0}} viewport={{once: true}}>
          <div className={styles.stepNumber}>03</div>
          <div className={styles.stepContent}>
            <h3>Pickup & Use</h3>
            <p>Follow the safety checklist for the exchange. Safely verify condition with our AI Assistant, then confirm receipt to release escrow funds.</p>
          </div>
          <div className={styles.stepImage}>
             <div style={{width:'100%', height:'100%', background:'#f1f5f9', display:'flex', flexDirection: 'column', alignItems:'center', justifyContent:'center', color: 'var(--success)'}}>
                <ShieldCheck size={100} strokeWidth={1.5} />
                <div style={{marginTop: '1.5rem', fontWeight: 700, fontSize: '1.5rem', color: '#0f172a'}}>100% Escrow Protected</div>
             </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
