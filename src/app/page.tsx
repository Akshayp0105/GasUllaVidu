"use client";

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ShieldCheck, MapPin, Search, Zap, Handshake, 
  BarChart3, Plus, ArrowRight, Flame
} from 'lucide-react';
import styles from './page.module.css';
import { useRef } from 'react';

export default function Home() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityParallax = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, damping: 20 } 
    }
  } as const;

  return (
    <main className={styles.main}>
      <div className="global-grid-bg" />
      <div className={styles.bgGradient} />

      {/* Hero Section */}
      <section className={styles.hero} ref={targetRef}>
        <motion.div 
          style={{ y: yParallax, opacity: opacityParallax, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          initial="hidden" animate="show" variants={containerVariants}
        >
          <motion.div variants={itemVariants} className={styles.heroTag}>
             <Flame size={16} className={styles.heroTagIcon} />
             <span>Hyperlocal LPG Marketplace</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className={styles.heroTitle}>
            Find or Share LPG <br/>
            <span className={styles.heroTitleHighlight}>Nearby Instantly</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className={styles.heroSubtitle}>
            Connect with your neighbors to find affordable LPG cylinders or share your extra gas. Safe, quick, and community-driven.
          </motion.p>
          
          <motion.div variants={itemVariants} className={styles.heroActionsRow}>
            <Link href="/listings" className={`${styles.heroBtn} ${styles.heroBtnPrimary}`}>
              <Search size={18} /> Need Gas
            </Link>
            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 8px' }} className="hidden-mobile"></div>
            <Link href="/listings/new" className={`${styles.heroBtn} ${styles.heroBtnSecondary}`}>
              <Plus size={18} /> Share Cylinder
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Abstract Dashboard/Product Visual */}
      <motion.section 
         className={styles.interactivePreview}
         initial={{ opacity: 0, y: 40 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true, margin: "-100px" }}
         transition={{ duration: 0.8, type: "spring", stiffness: 60 }}
      >
         <div className={styles.previewHeader}>
            <div className={styles.macDots}>
               <div className={styles.macDot} style={{ background: '#ff5f56' }}/>
               <div className={styles.macDot} style={{ background: '#ffbd2e' }}/>
               <div className={styles.macDot} style={{ background: '#27c93f' }}/>
            </div>
         </div>
         <div className={styles.previewImageWrap}>
            {/* A placeholder for a sleek app screenshot */}
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #18181b, #09090b)', position: 'absolute', top: 60 }}>
               {/* Abstract App UI Mockup via CSS */}
               <div style={{ padding: '3rem 4rem', display: 'flex', gap: '2rem' }}>
                  <div style={{ width: '260px', height: '400px', background: '#27272a', borderRadius: '16px', padding: '1.5rem' }}>
                     <div style={{ width: '60%', height: '12px', background: '#3f3f46', borderRadius: '4px', marginBottom: '2rem' }} />
                     <div style={{ width: '100%', height: '40px', background: '#3f3f46', borderRadius: '8px', marginBottom: '1rem' }} />
                     <div style={{ width: '100%', height: '40px', background: 'var(--accent-secondary)', borderRadius: '8px', marginBottom: '1rem' }} />
                  </div>
                  <div style={{ flex: 1, background: '#27272a', borderRadius: '16px', padding: '1.5rem' }}>
                     <div style={{ width: '30%', height: '24px', background: '#3f3f46', borderRadius: '4px', marginBottom: '2rem' }} />
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ height: '120px', background: '#3f3f46', borderRadius: '12px' }}/>
                        <div style={{ height: '120px', background: '#3f3f46', borderRadius: '12px' }}/>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <motion.div 
            initial={{ y: 0 }} animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className={styles.floatingCard}
         >
            <ShieldCheck size={28} color="#10b981" />
            <div>
               <div style={{fontWeight: 600, fontSize: '0.95rem'}}>Match Found</div>
               <div style={{color: '#a1a1aa', fontSize: '0.8rem'}}>Neighbor 400m away</div>
            </div>
         </motion.div>
      </motion.section>

      {/* Feature Grid */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Everything you need to share safely</h2>
        </div>
        
        <div className={styles.featureGrid}>
          {[
            { 
               icon: MapPin, 
               title: 'Hyperlocal Radius', 
               desc: 'Discover available cylinders from vetted users within a 5km radius. Minimal travel, zero wait times.' 
            },
            { 
               icon: Handshake, 
               title: 'Secured Escrow', 
               desc: 'Funds are held securely and only released when the exchange is physically confirmed by both parties.' 
            },
            { 
               icon: ShieldCheck, 
               title: 'Identity Verification', 
               desc: 'Every user passes mandatory Government ID checks to keep the network closed, safe, and accountable.' 
            },
            { 
               icon: Zap, 
               title: 'Fair Pricing Engine', 
               desc: 'Algorithms cap prices based on current market rates. No price gouging during shortages.' 
            },
            { 
               icon: BarChart3, 
               title: 'Instant Availability', 
               desc: 'Live stock syncing. You see exactly what is available down the street in real-time.' 
            },
            { 
               icon: Flame, 
               title: 'Quality Controlled', 
               desc: 'Visual inspections and brand specific matching ensures you get the exact cylinder you need.' 
            }
          ].map((feat, i) => (
            <motion.div 
               key={feat.title}
               className={styles.featureCard}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ delay: i * 0.05, duration: 0.5 }}
            >
              <div className={styles.featureIcon}>
                <feat.icon size={26} strokeWidth={2.5} />
              </div>
              <h3 className={styles.featureTitle}>{feat.title}</h3>
              <p className={styles.featureDesc}>{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Minimal Footer CTA */}
      <section className={styles.ctaFooter}>
        <motion.div 
           className={styles.ctaBox}
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
        >
          <h2 className={styles.ctaTitle}>Ready to fuel your community?</h2>
          <p className={styles.heroSubtitle} style={{ marginBottom: '2.5rem' }}>
            Join thousands of verified neighbors shaping the most efficient LPG sharing network.
          </p>
          <Link href="/auth/signin" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
            Create Free Account <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
