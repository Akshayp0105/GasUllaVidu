"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Search, Flame, MessageSquare, User, ShieldCheck,
  LogOut, Plus, CreditCard, Phone, MapPin, FileText, Star, 
  CheckCircle2, TrendingUp, Bell, Settings, ChevronRight, 
  Activity, ExternalLink, Menu, X
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/components/AuthProvider'
import styles from './dashboard.module.css';

const ID_LABELS: Record<string, string> = {
  AADHAAR: 'Aadhar Card',
  PAN: 'PAN Card',
  DRIVING_LICENSE: 'Driving Licence',
  VOTER_ID: 'Voter ID',
};

export type DBUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  phone: string | null;
  address: string | null;
  idProofType: string | null;
  idProofNumber: string | null;
  idProofDocUrl: string | null;
  profileComplete: boolean;
  createdAt: string;
};

type ActiveSection = 'overview' | 'listings' | 'chats' | 'profile' | 'settings';

const navItems: { id: ActiveSection; label: string; icon: any }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'listings', label: 'My Listings', icon: Flame },
  { id: 'chats', label: 'Messages', icon: MessageSquare },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const fadeUp: any = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, type: 'spring', stiffness: 100, damping: 20 },
  }),
};

export default function DashboardClient({ user }: { user: DBUser }) {
  const [active, setActive] = useState<ActiveSection>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useAuth()

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '';

  const firstName = user.name?.split(' ')[0] || 'User';
  const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className={styles.shell}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        {/* Brand - mobile only basically via CSS */}
        <div className={styles.brand}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <Flame size={20} color="var(--accent-secondary)" />
            <span style={{fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text-primary)'}}>GasUllaVidu</span>
          </div>
          <button className={styles.closeSidebar} onClick={() => setSidebarOpen(false)} style={{background: 'transparent', border:'none'}}>
            <X size={20} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Avatar */}
        <div className={styles.sidebarProfile}>
          <div className={styles.avatarWrap}>
            {user.image ? (
              <img src={user.image} alt={user.name || ''} className={styles.avatar} />
            ) : (
              <div className={styles.avatarText}>{initials}</div>
            )}
            <div className={styles.onlineDot} />
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.profileName}>{user.name}</div>
            <div className={styles.verifiedTag}>
              <ShieldCheck size={12} /> Verified Member
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`${styles.navItem} ${active === id ? styles.navActive : ''}`}
              onClick={() => { setActive(id); setSidebarOpen(false); }}
            >
              <Icon size={18} strokeWidth={active === id ? 2.5 : 2} />
              <span>{label}</span>
              {active === id && (
                <motion.div className={styles.navIndicator} layoutId="navIndicator" transition={{type: "spring", stiffness: 300, damping: 30}} />
              )}
            </button>
          ))}
        </nav>

        {/* Post Listing CTA */}
        <Link href="/listings/new" className={styles.postBtn}>
          <Plus size={18} />
          Post Listing
        </Link>

        <button className={styles.signOutBtn} onClick={() => void signOut()}>
          <LogOut size={16} />
          Sign Out
        </button>

        <div className={styles.memberBadge}>Member since {memberSince}</div>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        {/* Top Bar for Mobile */}
        <header className={styles.topBar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
            <Menu size={22} color="var(--text-primary)" />
          </button>
          <div className={styles.topBarTitle}>
            {navItems.find(n => n.id === active)?.label}
          </div>
          <div className={styles.topBarRight}>
            <button className={styles.iconBtn}><Bell size={20} color="var(--text-secondary)" /></button>
            <div className={styles.topAvatar}>
              {user.image ? (
                <img src={user.image} alt="" className={styles.topAvatarImg} />
              ) : (
                <span>{initials}</span>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className={styles.content}>
          <AnimatePresence mode="wait">
            {active === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Welcome */}
                <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className={styles.welcomeRow}>
                  <div>
                    <h1 className={styles.pageTitle}>Welcome back, {firstName}</h1>
                    <p className={styles.pageSubtitle}>Here's what's happening in your local LPG network today.</p>
                  </div>
                  <Link href="/listings/new" className={styles.ctaBtn}>
                    <Plus size={18} /> Post Listing
                  </Link>
                </motion.div>

                {/* Stats */}
                <div className={styles.statsGrid}>
                  {[
                    { label: 'Active Listings', value: '0', sub: 'No listings', icon: Flame, color: '#e11d48', bg: 'rgba(225, 29, 72, 0.08)' },
                    { label: 'Total Completed', value: '0', sub: 'Lifetime trades', icon: CheckCircle2, color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' },
                    { label: 'Trust Score', value: 'New', sub: 'Complete profile', icon: Star, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
                    { label: 'Local Connections', value: '0', sub: 'Neighbors linked', icon: Activity, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)' },
                  ].map(({ label, value, sub, icon: Icon, color, bg }, i) => (
                    <motion.div key={label} custom={i + 1} variants={fadeUp} initial="hidden" animate="show" className={styles.statCard}>
                      <div className={styles.statIconWrap} style={{ background: bg, color }}>
                        <Icon size={22} strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className={styles.statLabel}>{label}</div>
                        <div className={styles.statValue}>{value}</div>
                        <div className={styles.statSub}>{sub}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show" className={styles.sectionHead}>
                  Quick Links
                </motion.div>
                <div className={styles.quickGrid}>
                  {[
                    { href: '/listings', label: 'Browse LPG Near Me', sub: 'Find available cylinders', icon: Search, color: '#3b82f6' },
                    { href: '/listings/new', label: 'Post Your Cylinder', sub: 'Share safely with neighbors', icon: Plus, color: '#10b981' },
                    { href: '#', label: 'View Transactions', sub: 'Your trade history', icon: TrendingUp, color: '#6366f1' },
                    { href: '#', label: 'Messages', sub: 'Chat with neighbors', icon: MessageSquare, color: '#f59e0b' },
                  ].map(({ href, label, sub, icon: Icon, color }, i) => (
                    <motion.div key={label} custom={i + 6} variants={fadeUp} initial="hidden" animate="show">
                      <Link href={href} className={styles.quickCard}>
                        <div className={styles.quickIcon} style={{ color }}>
                          <Icon size={24} />
                        </div>
                        <div>
                          <div className={styles.quickLabel}>{label}</div>
                          <div className={styles.quickSub}>{sub}</div>
                        </div>
                        <ChevronRight size={18} className={styles.quickArrow} />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Verification Banner */}
                <motion.div custom={10} variants={fadeUp} initial="hidden" animate="show" className={styles.verifyBanner}>
                  <div className={styles.verifyIconWrap}>
                    <ShieldCheck size={24} color="#10b981" />
                  </div>
                  <div>
                    <div className={styles.verifyTitle}>Identity Authenticated</div>
                    <div className={styles.verifySub}>
                      Your {ID_LABELS[user.idProofType || ''] || 'ID'} was securely verified.
                      {user.idProofDocUrl && (
                        <a href={user.idProofDocUrl} target="_blank" rel="noreferrer" className={styles.verifyLink}>
                          View documented proof <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {active === 'listings' && (
              <motion.div key="listings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className={styles.welcomeRow}>
                  <div>
                    <h1 className={styles.pageTitle}>My Listings</h1>
                    <p className={styles.pageSubtitle}>Manage your shared LPG inventory.</p>
                  </div>
                  <Link href="/listings/new" className={styles.ctaBtn}>
                    <Plus size={18} /> Add Listing
                  </Link>
                </div>
                <div className={styles.emptyState}>
                  <Flame size={56} color="var(--border-color-hover)" strokeWidth={1.5} />
                  <h3>No listings active</h3>
                  <p>Share your spare cylinder with the community today.</p>
                  <Link href="/listings/new" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                    <Plus size={16} /> Create Listing
                  </Link>
                </div>
              </motion.div>
            )}

            {active === 'chats' && (
              <motion.div key="chats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h1 className={styles.pageTitle}>Conversations</h1>
                <p className={styles.pageSubtitle}>Communicate privately with matched neighbors.</p>
                <div className={styles.emptyState}>
                  <MessageSquare size={56} color="var(--border-color-hover)" strokeWidth={1.5} />
                  <h3>Your inbox is quiet</h3>
                  <p>Browse local listings to initiate an exchange connection.</p>
                  <Link href="/listings" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                    <Search size={16} /> Find Matches
                  </Link>
                </div>
              </motion.div>
            )}

            {active === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h1 className={styles.pageTitle}>Profile Configuration</h1>
                <p className={styles.pageSubtitle}>Your personal contact setup and verifiable proofs.</p>

                <div className={styles.profileCard}>
                  <div>
                    {user.image ? (
                      <img src={user.image} alt="" className={styles.profileBigAvatar} />
                    ) : (
                      <div className={styles.profileBigAvatarText}>{initials}</div>
                    )}
                  </div>
                  <div>
                    <div className={styles.profileCardName}>{user.name}</div>
                    <div className={styles.profileCardEmail}>{user.email}</div>
                    <div className={styles.profileVerifiedTag}><ShieldCheck size={14} /> Trust Certified</div>
                  </div>
                </div>

                <div className={styles.detailsGrid}>
                  {[
                    { icon: Phone, label: 'Contact Phone', value: `+91 ${user.phone}` },
                    { icon: MapPin, label: 'Linked Address', value: user.address },
                    { icon: CreditCard, label: 'Submitted Proof', value: ID_LABELS[user.idProofType || ''] || user.idProofType },
                    { icon: FileText, label: 'Document Number', value: user.idProofNumber },
                  ].map(({ icon: Icon, label, value }, i) => (
                    <motion.div key={label} custom={i} variants={fadeUp} initial="hidden" animate="show" className={styles.detailCard}>
                      <div className={styles.detailIconWrap}><Icon size={20} /></div>
                      <div>
                        <div className={styles.detailLabel}>{label}</div>
                        <div className={styles.detailValue}>{value}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {user.idProofDocUrl && (
                  <a href={user.idProofDocUrl} target="_blank" rel="noreferrer" className={styles.viewDocBtn}>
                    <ExternalLink size={18} /> Access Digital Scan
                  </a>
                )}
              </motion.div>
            )}

            {active === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h1 className={styles.pageTitle}>Preferences</h1>
                <p className={styles.pageSubtitle}>Fine-tune your application behavior and security.</p>
                <div className={styles.settingsGroup}>
                  <div className={styles.settingsItem}>
                    <div>
                      <div className={styles.settingLabel}>Alerts & Notifications</div>
                      <div className={styles.settingSub}>Control SMS and email dispatches</div>
                    </div>
                    <button className={styles.settingBtn}>Edit</button>
                  </div>
                  <div className={styles.settingsItem}>
                    <div>
                      <div className={styles.settingLabel}>Location Masking</div>
                      <div className={styles.settingSub}>Adjust how neighbors see your precise location radius</div>
                    </div>
                    <button className={styles.settingBtn}>Adjust</button>
                  </div>
                  <div className={styles.settingsItem}>
                    <div>
                      <div className={styles.settingLabel}>Login Security</div>
                      <div className={styles.settingSub}>Manage OAuth or localized passwords</div>
                    </div>
                    <button className={styles.settingBtn}>Review</button>
                  </div>
                  <div className={`${styles.settingsItem} ${styles.settingsDanger}`}>
                    <div>
                      <div className={styles.settingLabel}>Terminate Session</div>
                      <div className={styles.settingSub}>Securely logout of this device locally</div>
                    </div>
                    <button className={styles.settingDangerBtn} onClick={() => void signOut()}>
                      Sign Out
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
