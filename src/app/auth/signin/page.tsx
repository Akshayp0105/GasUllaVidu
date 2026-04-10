"use client";

import { useState, useEffect } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '@/app/components/AuthProvider'
import { auth, ensureFirebasePersistence, googleProvider } from '@/lib/firebase/client'
import styles from './signin.module.css'

const PARTICLES = [
  { x: -32, targetX: 84, duration: 4.6, delay: 0.3, left: '14%', bottom: '8%', size: '6px' },
  { x: 18, targetX: -72, duration: 5.1, delay: 1.2, left: '22%', bottom: '4%', size: '8px' },
  { x: -10, targetX: 60, duration: 6.2, delay: 2.1, left: '31%', bottom: '10%', size: '5px' },
  { x: 26, targetX: -54, duration: 4.8, delay: 2.8, left: '40%', bottom: '3%', size: '7px' },
  { x: -40, targetX: 92, duration: 7.3, delay: 0.7, left: '48%', bottom: '12%', size: '9px' },
  { x: 12, targetX: -80, duration: 5.5, delay: 1.8, left: '55%', bottom: '6%', size: '4px' },
  { x: -22, targetX: 68, duration: 6.6, delay: 3.1, left: '63%', bottom: '9%', size: '6px' },
  { x: 34, targetX: -48, duration: 4.9, delay: 4.2, left: '69%', bottom: '5%', size: '7px' },
  { x: -28, targetX: 76, duration: 5.8, delay: 1.5, left: '76%', bottom: '11%', size: '5px' },
  { x: 16, targetX: -64, duration: 6.1, delay: 3.6, left: '82%', bottom: '7%', size: '8px' },
  { x: -36, targetX: 88, duration: 7.1, delay: 2.4, left: '88%', bottom: '2%', size: '6px' },
  { x: 8, targetX: -52, duration: 5.3, delay: 4.8, left: '92%', bottom: '10%', size: '5px' },
]

function getFirebaseErrorMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.'
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password. Please try again.'
      case 'auth/popup-closed-by-user':
        return 'Google sign-in was cancelled.'
      case 'auth/weak-password':
        return 'Password must be at least 8 characters.'
      default:
        return 'Authentication failed. Please try again.'
    }
  }

  return 'Authentication failed. Please try again.'
}

async function resetFailedFirebaseLogin() {
  await auth.signOut().catch(() => {})
}

export default function SignInPage() {
  const router = useRouter()
  const { user: authUser, loading: authLoading, syncSession } = useAuth()
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })

  // Auto-redirect if already signed in
  useEffect(() => {
    let mounted = true

    if (authUser && !authLoading && !redirecting) {
      setRedirecting(true)
      
      // We must ensure the backend session is created for this Firebase user
      // If it fails (e.g., deleted from DB), it stops the redirect loop.
      syncSession(authUser)
        .then(() => {
          if (mounted) window.location.href = '/onboarding-check'
        })
        .catch(async (error) => {
          console.error("Auto-sync failed", error)
          await auth.signOut().catch(() => {})
          if (mounted) {
            setRedirecting(false)
            setError('Your login session expired. Please sign in again.')
          }
        })
    }

    return () => { mounted = false }
  }, [authUser, authLoading, redirecting, syncSession])

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)

    try {
      await ensureFirebasePersistence()
      const result = await signInWithPopup(auth, googleProvider)
      await syncSession(result.user)
      setRedirecting(true)
      window.location.href = '/onboarding-check'
    } catch (error) {
      await resetFailedFirebaseLogin()
      setError(getFirebaseErrorMessage(error))
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await ensureFirebasePersistence()
      const result = await signInWithEmailAndPassword(auth, form.email, form.password)
      await syncSession(result.user)
      setRedirecting(true)
      window.location.href = '/onboarding-check'
    } catch (error) {
      await resetFailedFirebaseLogin()
      setError(getFirebaseErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      await ensureFirebasePersistence()
      const result = await createUserWithEmailAndPassword(auth, form.email, form.password)

      if (form.name.trim()) {
        await updateProfile(result.user, { displayName: form.name.trim() })
      }
      await syncSession(auth.currentUser ?? result.user)
      setRedirecting(true)
      window.location.href = '/onboarding-check'
    } catch (error) {
      await resetFailedFirebaseLogin()
      setError(getFirebaseErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  if (redirecting) {
    return (
      <div className={styles.container}>
        <div className={styles.bgGradient} />
        <div className={styles.bgGrid} />
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Loader2 size={36} className={styles.spin} />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.bgGradient} />
      <div className={styles.bgGrid} />
      {PARTICLES.map((particle, i) => (
        <motion.div
          key={i}
          className={styles.particle}
          initial={{ opacity: 0, y: 0, x: particle.x }}
          animate={{
            opacity: [0, 0.6, 0],
            y: -300,
            x: particle.targetX,
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          style={{
            left: particle.left,
            bottom: particle.bottom,
            width: particle.size,
            height: particle.size,
          }}
        />
      ))}

      <motion.button
        className={styles.backBtn}
        onClick={() => router.push('/')}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </motion.button>

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>
            <Flame size={22} strokeWidth={2} />
          </div>
          <span className={styles.logoText}>GasUllaVidu</span>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'signin' ? styles.tabActive : ''}`}
            onClick={() => {
              setTab('signin')
              setError('')
            }}
          >
            Sign In
          </button>
          <button
            className={`${styles.tab} ${tab === 'signup' ? styles.tabActive : ''}`}
            onClick={() => {
              setTab('signup')
              setError('')
            }}
          >
            Create Account
          </button>
          <motion.div
            className={styles.tabIndicator}
            animate={{ x: tab === 'signin' ? 0 : '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>

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
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              {tab === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
            </motion.button>

            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <span className={styles.dividerText}>or</span>
              <div className={styles.dividerLine} />
            </div>

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
                      onChange={(e) => update('name', e.target.value)}
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
                    onChange={(e) => update('email', e.target.value)}
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
                    placeholder={tab === 'signup' ? 'Min. 8 characters' : '********'}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    required
                    autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPass((current) => !current)}
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
                      onChange={(e) => update('confirm', e.target.value)}
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
  )
}
