"use client";

import Link from 'next/link';
import { Flame, LayoutDashboard, LogIn, Loader2, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/components/AuthProvider'
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.nav
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.navContainer}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Flame size={18} strokeWidth={2.5} />
          </div>
          <span className={styles.logoText}>GasUllaVidu</span>
        </Link>

        {/* Center Links */}
        <div className={styles.navLinks}>
          <Link href="/" className={styles.link}>Home</Link>
          <Link href="/listings" className={styles.link}>Browse</Link>
          <Link href="/listings/new" className={styles.link}>+ Share Cylinder</Link>
          <Link href="/dashboard" className={styles.link}>Messages</Link>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {loading ? (
            <Loader2 size={18} className={styles.spin} />
          ) : user ? (
            <>
              <Link href="/dashboard" className="btn btn-ghost" style={{ padding: '0.5rem 1rem' }}>
                <LayoutDashboard size={16} /> Profile
              </Link>
              <Link href="/listings/new" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>
                 Share Cylinder
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="btn btn-ghost" style={{ padding: '0.5rem 1rem' }}>
                <LogIn size={16} /> Login
              </Link>
              <Link href="/auth/signin" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>
                Get Started
              </Link>
            </>
          )}

          {/* Mobile Menu */}
          <button className={styles.mobileMenuBtn} onClick={() => setMobileOpen(p => !p)}>
            <Menu size={22} color="var(--text-primary)" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Link href="/" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href="/listings" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
              Browse Listings
            </Link>
            <Link href="/listings/new" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
              + Share Cylinder
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                  Profile & Dashboard
                </Link>
                <button className={`${styles.mobileLink} ${styles.mobileDanger}`} onClick={async () => { await signOut(); setMobileOpen(false); }}>
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/auth/signin" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
