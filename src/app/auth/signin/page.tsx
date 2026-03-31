"use client";

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import styles from './signin.module.css';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  // Show error from NextAuth callback
  useEffect(() => {
    const err = searchParams?.get('error');
    if (err === 'CredentialsSignin') setError('Invalid email or password.');
    else if (err) setError('Sign-in failed. Please try again.');
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signIn('google', { callbackUrl: '/onboarding-check' });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError('Invalid email or password. Please try again.');
    } else {
      router.push('/onboarding-check');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Sign-up failed.'); setLoading(false); return; }
      // Auto sign in after signup
      const signInRes = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      setLoading(false);
      if (signInRes?.error) {
        setSuccess('Account created! Please sign in.');
        setTab('signin');
      } else {
        router.push('/onboarding-check');
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const particles = Array.from({ length: 12 });

  return (
    <div className={styles.container}>
      {/* Animated Background */}
      <div className={styles.bgGradient} />
      <div className={styles.bgGrid} />
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className={styles.particle}
          initial={{ opacity: 0, y: 0, x: Math.random() * 100 - 50 }}
          animate={{
            opacity: [0, 0.6, 0],
            y: -300,
            x: Math.random() * 200 - 100,
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            delay: Math.random() * 6,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          style={{
            left: `${10 + Math.random() * 80}%`,
            bottom: `${Math.random() * 20}%`,
            width: `${4 + Math.random() * 6}px`,
            height: `${4 + Math.random() * 6}px`,
          }}
        />
      ))}

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>
            <Flame size={22} strokeWidth={2} />
          </div>
          <span className={styles.logoText}>GasUllaVidu</span>
        </div>

        {/* Tab Switcher */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'signin' ? styles.tabActive : ''}`}
            onClick={() => { setTab('signin'); setError(''); setSuccess(''); }}
          >
            Sign In
          </button>
          <button
            className={`${styles.tab} ${tab === 'signup' ? styles.tabActive : ''}`}
            onClick={() => { setTab('signup'); setError(''); setSuccess(''); }}
          >
            Create Account
          </button>
          <motion.div
            className={styles.tabIndicator}
            animate={{ x: tab === 'signin' ? 0 : '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: tab === 'signin' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: tab === 'signin' ? 20 : -20 }}
            transition={{ duration: 0.25 }}
          >
            <div className={styles.heading}>
              <h1 className={styles.title}>
                {tab === 'signin' ? 'Welcome back' : 'Join GasUllaVidu'}
              </h1>
              <p className={styles.subtitle}>
                {tab === 'signin'
                  ? 'Sign in to access the hyperlocal LPG network.'
                  : 'Create an account to start sharing LPG safely.'}
              </p>
            </div>

            {/* Google Button */}
            <motion.button
              className={styles.googleBtn}
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
            >
              {googleLoading ? (
                <Loader2 size={18} className={styles.spin} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {tab === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
            </motion.button>

            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <span className={styles.dividerText}>or</span>
              <div className={styles.dividerLine} />
            </div>

            {/* Form */}
            <form onSubmit={tab === 'signin' ? handleSignIn : handleSignUp} className={styles.form}>
              {tab === 'signup' && (
                <motion.div
                  className={styles.fieldWrap}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className={styles.label}>Full Name</label>
                  <div className={styles.inputWrap}>
                    <input
                      id="signup-name"
                      className={styles.input}
                      type="text"
                      placeholder="Ramesh Kumar"
                      value={form.name}
                      onChange={e => update('name', e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>
                </motion.div>
              )}

              <div className={styles.fieldWrap}>
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrap}>
                  <Mail size={16} className={styles.inputIcon} />
                  <input
                    id={tab === 'signin' ? 'signin-email' : 'signup-email'}
                    className={styles.input}
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className={styles.fieldWrap}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrap}>
                  <Lock size={16} className={styles.inputIcon} />
                  <input
                    id={tab === 'signin' ? 'signin-password' : 'signup-password'}
                    className={styles.input}
                    type={showPass ? 'text' : 'password'}
                    placeholder={tab === 'signup' ? 'Min. 8 characters' : '••••••••'}
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    required
                    autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPass(p => !p)}
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {tab === 'signup' && (
                <motion.div
                  className={styles.fieldWrap}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <label className={styles.label}>Confirm Password</label>
                  <div className={styles.inputWrap}>
                    <Lock size={16} className={styles.inputIcon} />
                    <input
                      id="signup-confirm"
                      className={styles.input}
                      type={showPass ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={form.confirm}
                      onChange={e => update('confirm', e.target.value)}
                      required
                    />
                  </div>
                </motion.div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.div
                    className={styles.errorBox}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <AlertCircle size={15} />
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    className={styles.successBox}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                id={tab === 'signin' ? 'signin-submit' : 'signup-submit'}
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
              >
                {loading ? (
                  <Loader2 size={18} className={styles.spin} />
                ) : (
                  <>
                    {tab === 'signin' ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </form>

            <p className={styles.terms}>
              By continuing, you agree to our{' '}
              <Link href="#">Terms of Service</Link> and{' '}
              <Link href="#">Privacy Policy</Link>.
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <Loader2 size={32} className={styles.spin} color="var(--accent-primary)" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
