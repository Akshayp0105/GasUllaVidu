"use client";

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadButton } from '@uploadthing/react'
import type { OurFileRouter } from '@/app/api/uploadthing/core'
import { User, MapPin, Phone, ShieldCheck, CreditCard, FileText, Car, CheckCircle2, Upload } from 'lucide-react'
import { useAuth } from '@/app/components/AuthProvider'
import styles from './onboarding.module.css'

const ID_TYPES = [
  { value: 'AADHAAR', label: 'Aadhar Card', icon: CreditCard, hint: '12-digit UID number' },
  { value: 'PAN', label: 'PAN Card', icon: FileText, hint: 'ABCDE1234F format' },
  { value: 'DRIVING_LICENSE', label: 'Driving Licence', icon: Car, hint: 'State-issued DL number' },
  { value: 'VOTER_ID', label: 'Voter ID', icon: ShieldCheck, hint: 'Election Commission ID' },
]

const STEPS = ['Personal Info', 'Address', 'ID Verification']

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    idProofType: '',
    idProofNumber: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/signin')
    }
  }, [authLoading, router, user])

  useEffect(() => {
    if (user?.displayName) {
      setForm((current) => ({
        ...current,
        name: current.name || user.displayName || '',
      }))
    }
  }, [user])

  const update = (field: string, value: string) =>
    setForm((current) => ({ ...current, [field]: value }))

  const validateStep = () => {
    if (step === 0) {
      if (!form.name.trim()) return 'Full name is required.'
      if (!/^\d{10}$/.test(form.phone)) return 'Enter a valid 10-digit phone number.'
    }
    if (step === 1) {
      if (form.address.trim().length < 15) return 'Please enter your full address (min 15 chars).'
    }
    if (step === 2) {
      if (!form.idProofType) return 'Please select an ID type.'
      if (!form.idProofNumber.trim()) return 'Please enter the ID number.'
      if (!uploadedUrl) return 'Please upload a photo or scan of your ID document.'
    }
    return ''
  }

  const handleNext = () => {
    const nextError = validateStep()
    if (nextError) {
      setError(nextError)
      return
    }
    setError('')
    setStep((current) => current + 1)
  }

  const handleSubmit = async () => {
    const nextError = validateStep()
    if (nextError) {
      setError(nextError)
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          address: form.address,
          idProofType: form.idProofType,
          idProofNumber: form.idProofNumber,
          idProofDocUrl: uploadedUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }
      router.push('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 80, damping: 17 } },
    exit: { opacity: 0, x: -20 },
  }

  return (
    <div className={styles.container}>
      <div className={styles.bgGlow}></div>

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.header}>
          <div className={styles.stepBadge}>Step {step + 1} of {STEPS.length}</div>
          <h1 className={styles.title}>Complete Your Profile</h1>
          <p className={styles.subtitle}>This is required to trade on GasUllaVidu. Your data is encrypted and safe.</p>
        </div>

        <div className={styles.progressTrack}>
          {STEPS.map((label, index) => (
            <div key={label} className={`${styles.progressStep} ${index <= step ? styles.progressActive : ''}`}>
              <div className={styles.progressDot}>
                {index < step ? <CheckCircle2 size={14} /> : <span>{index + 1}</span>}
              </div>
              <span className={styles.progressLabel}>{label}</span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" variants={itemVariants} initial="hidden" animate="show" exit="exit" className={styles.stepContent}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}><User size={15} /> Full Name</label>
                <input
                  className={styles.input}
                  placeholder="e.g. Ramesh Kumar"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}><Phone size={15} /> Phone Number</label>
                <div className={styles.phoneRow}>
                  <span className={styles.countryCode}>+91</span>
                  <input
                    className={styles.input}
                    placeholder="9876543210"
                    value={form.phone}
                    maxLength={10}
                    onChange={(e) => update('phone', e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" variants={itemVariants} initial="hidden" animate="show" exit="exit" className={styles.stepContent}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}><MapPin size={15} /> Current Address</label>
                <textarea
                  className={`${styles.input} ${styles.textarea}`}
                  placeholder="House No., Street, Area, City, State, PIN Code"
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  rows={4}
                />
                <span className={styles.hint}>This address will be used for cylinder pickup and delivery proximity.</span>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={itemVariants} initial="hidden" animate="show" exit="exit" className={styles.stepContent}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}><ShieldCheck size={15} /> Select ID Type</label>
                <div className={styles.idGrid}>
                  {ID_TYPES.map(({ value, label, icon: Icon, hint }) => (
                    <button
                      key={value}
                      className={`${styles.idOption} ${form.idProofType === value ? styles.idOptionActive : ''}`}
                      onClick={() => update('idProofType', value)}
                      type="button"
                    >
                      <Icon size={20} />
                      <span>{label}</span>
                      <small>{hint}</small>
                    </button>
                  ))}
                </div>
              </div>

              {form.idProofType && (
                <motion.div className={styles.fieldGroup} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <label className={styles.label}>ID Number</label>
                  <input
                    className={styles.input}
                    placeholder={ID_TYPES.find((type) => type.value === form.idProofType)?.hint}
                    value={form.idProofNumber}
                    onChange={(e) => update('idProofNumber', e.target.value.toUpperCase())}
                  />
                </motion.div>
              )}

              <div className={styles.fieldGroup}>
                <label className={styles.label}><Upload size={15} /> Upload ID Document</label>
                <div className={styles.uploadZone}>
                  {uploadedUrl ? (
                    <div className={styles.uploadSuccess}>
                      <CheckCircle2 size={28} color="#10b981" />
                      <p>Document uploaded successfully!</p>
                      <a href={uploadedUrl} target="_blank" rel="noreferrer" className={styles.viewLink}>View uploaded file</a>
                    </div>
                  ) : (
                    <div className={styles.uploadPrompt}>
                      <Upload size={28} color="rgba(255,255,255,0.4)" />
                      <p>Upload a clear photo or scanned copy</p>
                      <small>JPG, PNG, or PDF max 4MB</small>
                      <UploadButton<OurFileRouter, 'idProofUploader'>
                        endpoint="idProofUploader"
                        onUploadBegin={() => setUploading(true)}
                        onClientUploadComplete={(res) => {
                          setUploading(false)
                          if (res?.[0]?.url) setUploadedUrl(res[0].url)
                        }}
                        onUploadError={(error) => {
                          setUploading(false)
                          setError(`Upload failed: ${error.message}`)
                        }}
                        className={styles.uploadBtn}
                      />
                      {uploading && <div className={styles.uploadingText}>Uploading...</div>}
                    </div>
                  )}
                </div>
                <span className={styles.hint}>Without a valid ID document upload, you cannot create an account.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div className={styles.error} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {error}
          </motion.div>
        )}

        <div className={styles.navButtons}>
          {step > 0 && (
            <button className={styles.backBtn} onClick={() => { setStep((current) => current - 1); setError('') }}>
              Back
            </button>
          )}
          {step < 2 ? (
            <motion.button
              className={styles.nextBtn}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
            >
              Continue
            </motion.button>
          ) : (
            <motion.button
              className={`${styles.nextBtn} ${styles.submitBtn}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Creating Profile...' : 'Complete Profile'}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
