import { getApp, getApps, initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from 'firebase/auth'
import { firebaseConfig } from '@/lib/firebase/config'

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)
const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({ prompt: 'select_account' })

let persistencePromise: Promise<void> | null = null

export function ensureFirebasePersistence() {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  if (!persistencePromise) {
    persistencePromise = setPersistence(auth, browserLocalPersistence)
  }

  return persistencePromise
}

export { app, auth, db, storage, googleProvider }
