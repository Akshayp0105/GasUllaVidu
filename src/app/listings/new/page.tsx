"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Flame, CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase/client';
import { createListing } from '@/lib/firebase/listings';
import { useAuth } from '@/app/components/AuthProvider';
import styles from './new-listing.module.css';

export default function NewListingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState({
    brand: 'Indane',
    weight: '14.2kg',
    condition: 'Factory Sealed',
    level: 100,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login first to create a listing.");
      return;
    }
    setLoading(true);
    
    try {
      await createListing(db, {
        ...form,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
      });
      router.push('/listings');
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("Failed to create listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ChevronLeft size={20} /> Back
        </button>
        <div className={styles.headerTitle}>Share Cylinder</div>
        <div style={{ width: 100 }} /> {/* spacer */}
      </div>

      <div className={styles.content}>
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.cardHeader}>
            <div className={styles.iconWrap}>
              <Flame size={24} color="var(--accent-secondary)" />
            </div>
            <div>
              <h1 className={styles.title}>Post Local Listing</h1>
              <p className={styles.subtitle}>List your spare LPG cylinder for the community. Safe and quick.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.fieldWrap}>
                <label className={styles.label}>Cylinder Brand</label>
                <select
                  className={styles.select}
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                >
                  <option>Indane</option>
                  <option>HP Gas</option>
                  <option>Bharat Gas</option>
                </select>
              </div>

              <div className={styles.fieldWrap}>
                <label className={styles.label}>Weight</label>
                <select
                  className={styles.select}
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                >
                  <option>14.2kg (Standard Domestic)</option>
                  <option>5kg (Chhotu)</option>
                  <option>19kg (Commercial)</option>
                </select>
              </div>

              <div className={styles.fieldWrap}>
                <label className={styles.label}>Condition Status</label>
                <select
                  className={styles.select}
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                >
                  <option>Factory Sealed</option>
                  <option>Used</option>
                </select>
              </div>

              <div className={styles.fieldWrap}>
                <label className={styles.label}>Estimated Remaining (%)</label>
                <input
                  type="number"
                  className={styles.input}
                  min="1" max="100"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
                  disabled={form.condition.includes('Factory Sealed')}
                />
              </div>
            </div>

            <div className={styles.verificationBox}>
              <CheckCircle2 size={20} color="var(--success)" />
              <span>By posting, you agree to our fair-pricing and security terms. Identity is verified.</span>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <Loader2 className={styles.spin} size={20} /> : 'Publish Listing'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
