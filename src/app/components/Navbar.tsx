"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Flame, LayoutDashboard, LogOut, LogIn, Search, Loader2, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.nav
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Logo */}
      <Link href="/" className={styles.logo}>
        <div className={styles.logoIcon}><Flame size={16} strokeWidth={2.5} /></div>
        <span className={styles.logoText}>GasUllaVidu</span>
      </Link>

      {/* Center Links */}
      <div className={styles.navLinks}>
        <Link href="/" className={styles.link}>Home</Link>
        <Link href="/listings" className={styles.link}>Browse</Link>
        {session && <Link href="/dashboard" className={styles.link}>Dashboard</Link>}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {loading ? (
          <Loader2 size={18} className={styles.spin} />
        ) : session ? (
          <>
            <Link href="/dashboard" className={styles.dashBtn}>
              <LayoutDashboard size={15} /> Dashboard
            </Link>
            <button className={styles.ghostBtn} onClick={() => signOut({ callbackUrl: '/' })}>
              <LogOut size={15} /> Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/signin" className={styles.ghostBtn}>
              <LogIn size={15} /> Sign In
            </Link>
            <Link href="/auth/signin" className={styles.primaryBtn}>
              Get Started
            </Link>
          </>
        )}

        {/* Mobile Menu */}
        <button className={styles.mobileMenuBtn} onClick={() => setMobileOpen(p => !p)}>
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Link href="/" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href="/listings" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
              <Search size={15} /> Browse Listings
            </Link>
            {session ? (
              <>
                <Link href="/dashboard" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <button className={`${styles.mobileLink} ${styles.mobileDanger}`} onClick={() => { signOut({ callbackUrl: '/' }); setMobileOpen(false); }}>
                  <LogOut size={15} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                  <LogIn size={15} /> Sign In
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
