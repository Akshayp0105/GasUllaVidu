import { initializeApp, getApps, cert, type AppOptions } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const firebaseAdminConfig: AppOptions = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
    }
    firebaseAdminConfig.credential = cert(serviceAccount)
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", err)
  }
} else {
  console.warn("WARNING: FIREBASE_SERVICE_ACCOUNT_KEY is not set in .env. Firebase Admin will fail to connect!")
}

const apps = getApps()

export const adminApp =
  apps.length === 0 ? initializeApp(firebaseAdminConfig) : apps[0]

export const adminDb = getFirestore(adminApp)
export const adminAuth = getAuth(adminApp)
