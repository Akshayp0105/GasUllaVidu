"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { onIdTokenChanged, signOut as firebaseSignOut, type User } from 'firebase/auth'
import { auth, ensureFirebasePersistence } from '@/lib/firebase/client'
import { clearFirebaseSession, syncFirebaseSession } from '@/lib/firebase/session'

type AuthContextValue = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  syncSession: (user: User) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    ensureFirebasePersistence().catch((error) => {
      console.error('Failed to initialize Firebase persistence.', error)
    })

    const unsubscribe = onIdTokenChanged(auth, async (nextUser) => {
      if (!active) return

      if (!nextUser) {
        setUser(null)
        await clearFirebaseSession().catch(() => {})
        if (active) setLoading(false)
        return
      }

      // If we have a Firebase user, we should ensure the backend session is synced
      // but we shouldn't block the UI unnecessarily if it's already logged in.
      // However, to prevent race conditions during redirect, we sync once if needed.
      try {
        await nextUser.getIdToken()
        // verify session via GET /api/auth/session or just set user
        // For simplicity and speed, we set the user first
        setUser(nextUser)
      } catch (error) {
        console.error('Session sync error:', error)
      } finally {
        if (active) setLoading(false)
      }
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signOut: async () => {
        await firebaseSignOut(auth)
        await clearFirebaseSession().catch(() => {})
      },
      syncSession: async (nextUser: User) => {
        const idToken = await nextUser.getIdToken()
        await syncFirebaseSession(idToken, {
          name: nextUser.displayName,
          image: nextUser.photoURL,
        })
        setUser(nextUser)
      },
    }),
    [loading, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider.')
  }

  return value
}
