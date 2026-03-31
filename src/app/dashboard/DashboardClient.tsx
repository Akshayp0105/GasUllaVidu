"use client";

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Search, Flame, MessageSquare, User, ShieldCheck,
  LogOut, Plus, CreditCard, Phone, MapPin, FileText, Star, 
  CheckCircle2, TrendingUp, Bell, Settings, ChevronRight, 
  Activity, ExternalLink, Menu, X
} from 'lucide-react';
import Link from 'next/link';
import styles from './dashboard.module.css';

const ID_LABELS: Record<string, string> = {
  AADHAAR: 'Aadhar Card',
  PAN: 'PAN Card',
  DRIVING_LICENSE: 'Driving Licence',
  VOTER_ID: 'Voter ID',
};

type DBUser = {
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
    transition: { delay: i * 0.07, type: 'spring', stiffness: 90, damping: 18 },
  }),
};

export default function DashboardClient({ user }: { user: DBUser }) {
  const [active, setActive] = useState<ActiveSection>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Flame size={18} />
          </div>
          <span className={styles.brandName}>GasUllaVidu</span>
          <button className={styles.closeSidebar} onClick={() => setSidebarOpen(false)}>
            <X size={18} />
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
              <ShieldCheck size={10} /> Verified
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
              <Icon size={17} />
              <span>{label}</span>
              {active === id && (
                <motion.div className={styles.navIndicator} layoutId="navIndicator" />
              )}
            </button>
          ))}
        </nav>

        {/* Post Listing CTA */}
        <Link href="/listings/new" className={styles.postBtn}>
          <Plus size={16} />
          Post Listing
        </Link>

        <button className={styles.signOutBtn} onClick={() => signOut({ callbackUrl: '/' })}>
          <LogOut size={15} />
          Sign Out
        </button>

        <div className={styles.memberBadge}>Member since {memberSince}</div>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        {/* Top Bar */}
        <header className={styles.topBar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className={styles.topBarTitle}>
            {navItems.find(n => n.id === active)?.label}
          </div>
          <div className={styles.topBarRight}>
            <button className={styles.iconBtn}><Bell size={18} /></button>
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
                    <h1 className={styles.pageTitle}>Welcome back, {firstName}! 👋</h1>
                    <p className={styles.pageSubtitle}>Here's what's happening on your LPG network today.</p>
                  </div>
                  <Link href="/listings/new" className={styles.ctaBtn}>
                    <Plus size={16} /> Post Listing
                  </Link>
                </motion.div>

                {/* Stats */}
                <div className={styles.statsGrid}>
                  {[
                    { label: 'Active Listings', value: '0', sub: 'No listings yet', icon: Flame, color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
                    { label: 'Total Transactions', value: '0', sub: 'Lifetime trades', icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                    { label: 'Trust Score', value: 'New', sub: 'Build your score', icon: Star, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                    { label: 'Connections', value: '0', sub: 'Neighbors linked', icon: Activity, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
                  ].map(({ label, value, sub, icon: Icon, color, bg }, i) => (
                    <motion.div key={label} custom={i + 1} variants={fadeUp} initial="hidden" animate="show" className={styles.statCard}>
                      <div className={styles.statIconWrap} style={{ background: bg, color }}>
                        <Icon size={20} />
                      </div>
                      <div className={styles.statBody}>
                        <div className={styles.statValue}>{value}</div>
                        <div className={styles.statLabel}>{label}</div>
                        <div className={styles.statSub}>{sub}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show" className={styles.sectionHead}>
                  <span>Quick Actions</span>
                </motion.div>
                <div className={styles.quickGrid}>
                  {[
                    { href: '/listings', label: 'Browse LPG Near Me', sub: 'Find available cylinders', icon: Search, color: '#3b82f6' },
                    { href: '/listings/new', label: 'Post Your Cylinder', sub: 'Share safely with neighbors', icon: Plus, color: '#10b981' },
                    { href: '#', label: 'View Transactions', sub: 'Your trade history', icon: TrendingUp, color: '#8b5cf6' },
                    { href: '#', label: 'Messages', sub: 'Chat with neighbors', icon: MessageSquare, color: '#f97316' },
                  ].map(({ href, label, sub, icon: Icon, color }, i) => (
                    <motion.div key={label} custom={i + 6} variants={fadeUp} initial="hidden" animate="show">
                      <Link href={href} className={styles.quickCard}>
                        <div className={styles.quickIcon} style={{ color }}>
                          <Icon size={22} />
                        </div>
                        <div className={styles.quickBody}>
                          <div className={styles.quickLabel}>{label}</div>
                          <div className={styles.quickSub}>{sub}</div>
                        </div>
                        <ChevronRight size={15} className={styles.quickArrow} />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Verification Banner */}
                <motion.div custom={10} variants={fadeUp} initial="hidden" animate="show" className={styles.verifyBanner}>
                  <div className={styles.verifyIconWrap}>
                    <ShieldCheck size={22} color="#10b981" />
                  </div>
                  <div className={styles.verifyBody}>
                    <div className={styles.verifyTitle}>Identity Verified ✅</div>
                    <div className={styles.verifySub}>
                      Your {ID_LABELS[user.idProofType || ''] || 'ID'} has been submitted.
                      {user.idProofDocUrl && (
                        <a href={user.idProofDocUrl} target="_blank" rel="noreferrer" className={styles.verifyLink}>
                          View document <ExternalLink size={12} />
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
                    <p className={styles.pageSubtitle}>Manage your LPG cylinder listings.</p>
                  </div>
                  <Link href="/listings/new" className={styles.ctaBtn}>
                    <Plus size={16} /> New Listing
                  </Link>
                </div>
                <div className={styles.emptyState}>
                  <Flame size={48} color="rgba(249,115,22,0.3)" />
                  <h3>No listings yet</h3>
                  <p>Post your first LPG cylinder listing to start connecting with neighbors.</p>
                  <Link href="/listings/new" className={styles.ctaBtn} style={{ marginTop: '1rem' }}>
                    <Plus size={16} /> Create Listing
                  </Link>
                </div>
              </motion.div>
            )}

            {active === 'chats' && (
              <motion.div key="chats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h1 className={styles.pageTitle}>Messages</h1>
                <p className={styles.pageSubtitle}>Chat with neighbors about LPG exchange.</p>
                <div className={styles.emptyState}>
                  <MessageSquare size={48} color="rgba(99,179,237,0.3)" />
                  <h3>No messages yet</h3>
                  <p>Browse listings and connect with neighbors to start chatting.</p>
                  <Link href="/listings" className={styles.ctaBtn} style={{ marginTop: '1rem' }}>
                    <Search size={16} /> Browse Listings
                  </Link>
                </div>
              </motion.div>
            )}

            {active === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h1 className={styles.pageTitle}>Your Profile</h1>
                <p className={styles.pageSubtitle}>Your personal details and verification info.</p>

                <div className={styles.profileCard}>
                  <div className={styles.profileCardAvatar}>
                    {user.image ? (
                      <img src={user.image} alt="" className={styles.profileBigAvatar} />
                    ) : (
                      <div className={styles.profileBigAvatarText}>{initials}</div>
                    )}
                  </div>
                  <div className={styles.profileCardInfo}>
                    <div className={styles.profileCardName}>{user.name}</div>
                    <div className={styles.profileCardEmail}>{user.email}</div>
                    <div className={styles.profileVerifiedTag}><ShieldCheck size={13} /> Identity Verified</div>
                  </div>
                </div>

                <div className={styles.detailsGrid}>
                  {[
                    { icon: Phone, label: 'Phone Number', value: `+91 ${user.phone}` },
                    { icon: MapPin, label: 'Address', value: user.address },
                    { icon: CreditCard, label: 'ID Proof Type', value: ID_LABELS[user.idProofType || ''] || user.idProofType },
                    { icon: FileText, label: 'ID Number', value: user.idProofNumber },
                  ].map(({ icon: Icon, label, value }, i) => (
                    <motion.div key={label} custom={i} variants={fadeUp} initial="hidden" animate="show" className={styles.detailCard}>
                      <div className={styles.detailIconWrap}><Icon size={17} /></div>
                      <div>
                        <div className={styles.detailLabel}>{label}</div>
                        <div className={styles.detailValue}>{value}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {user.idProofDocUrl && (
                  <a href={user.idProofDocUrl} target="_blank" rel="noreferrer" className={styles.viewDocBtn}>
                    <ExternalLink size={15} /> View Uploaded ID Document
                  </a>
                )}
              </motion.div>
            )}

            {active === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h1 className={styles.pageTitle}>Settings</h1>
                <p className={styles.pageSubtitle}>Manage your account settings and preferences.</p>
                <div className={styles.settingsGroup}>
                  <div className={styles.settingsItem}>
                    <div>
                      <div className={styles.settingLabel}>Notification Preferences</div>
                      <div className={styles.settingSub}>Manage how you receive alerts</div>
                    </div>
                    <button className={styles.settingBtn}>Configure</button>
                  </div>
                  <div className={styles.settingsItem}>
                    <div>
                      <div className={styles.settingLabel}>Privacy & Data</div>
                      <div className={styles.settingSub}>Control your data and visibility</div>
                    </div>
                    <button className={styles.settingBtn}>Manage</button>
                  </div>
                  <div className={styles.settingsItem}>
                    <div>
                      <div className={styles.settingLabel}>Account Security</div>
                      <div className={styles.settingSub}>Password and authentication</div>
                    </div>
                    <button className={styles.settingBtn}>Update</button>
                  </div>
                  <div className={`${styles.settingsItem} ${styles.settingsDanger}`}>
                    <div>
                      <div className={styles.settingLabel}>Sign Out</div>
                      <div className={styles.settingSub}>Sign out of all devices</div>
                    </div>
                    <button className={styles.settingDangerBtn} onClick={() => signOut({ callbackUrl: '/' })}>
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
