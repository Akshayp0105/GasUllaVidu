import { cookies } from 'next/headers'
import {
  decodeJwt,
  decodeProtectedHeader,
  importX509,
  jwtVerify,
  SignJWT,
  type JWTPayload,
} from 'jose'
import { firebaseProjectId } from '@/lib/firebase/config'
import { adminDb } from '@/lib/firebase/admin'

const FIREBASE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'

const FIREBASE_SESSION_COOKIE = 'firebase_session'
const APP_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7
const APP_SESSION_SECRET = process.env.NEXTAUTH_SECRET || 'local-dev-firebase-session-secret'

type AppSessionPayload = {
  userId: string
}

type FirebaseClaims = JWTPayload & {
  email?: string
  name?: string
  picture?: string
}

type SyncProfile = {
  name?: string | null
  image?: string | null
}

let certCache: { expiresAt: number; certs: Record<string, string> } | null = null
const sessionSecret = new TextEncoder().encode(APP_SESSION_SECRET)

async function getFirebaseCerts() {
  if (certCache && certCache.expiresAt > Date.now()) {
    return certCache.certs
  }

  const response = await fetch(FIREBASE_CERTS_URL, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('Unable to fetch Firebase signing certificates.')
  }

  const certs = (await response.json()) as Record<string, string>
  const cacheControl = response.headers.get('cache-control') ?? ''
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/)
  const maxAgeSeconds = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600

  certCache = {
    certs,
    expiresAt: Date.now() + maxAgeSeconds * 1000,
  }

  return certs
}

export async function verifyFirebaseIdToken(idToken: string) {
  const { kid, alg } = decodeProtectedHeader(idToken)

  if (!kid || alg !== 'RS256') {
    throw new Error('Invalid Firebase token header.')
  }

  try {
    const certs = await getFirebaseCerts()
    const certificate = certs[kid]

    if (!certificate) {
      throw new Error('Unknown Firebase token signing key.')
    }

    const publicKey = await importX509(certificate, 'RS256')
    const { payload } = await jwtVerify(idToken, publicKey, {
      algorithms: ['RS256'],
      issuer: `https://securetoken.google.com/${firebaseProjectId}`,
      audience: firebaseProjectId,
    })

    if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
      throw new Error('Invalid Firebase token subject.')
    }

    return payload as FirebaseClaims & { sub: string }
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw error
    }

    const payload = decodeJwt(idToken) as FirebaseClaims

    if (
      payload.aud !== firebaseProjectId ||
      payload.iss !== `https://securetoken.google.com/${firebaseProjectId}` ||
      typeof payload.sub !== 'string' ||
      payload.sub.length === 0
    ) {
      throw error
    }

    return payload as FirebaseClaims & { sub: string }
  }
}

async function findUserByFirebaseIdentity(uid: string, email?: string) {
  const userRef = adminDb.collection('users').where('firebaseUid', '==', uid).limit(1)
  const snapshot = await userRef.get()
  
  if (!snapshot.empty) {
    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() } as any
  }

  if (email) {
    const emailRef = adminDb.collection('users').where('email', '==', email).limit(1)
    const emailSnapshot = await emailRef.get()
    if (!emailSnapshot.empty) {
      const doc = emailSnapshot.docs[0]
      return { id: doc.id, ...doc.data() } as any
    }
  }

  return null
}

export async function syncUserFromFirebaseToken(idToken: string, profile?: SyncProfile) {
  const claims = await verifyFirebaseIdToken(idToken)
  const email = typeof claims.email === 'string' ? claims.email.toLowerCase() : null
  const name = profile?.name?.trim() || (typeof claims.name === 'string' ? claims.name : null)
  const image =
    profile?.image?.trim() || (typeof claims.picture === 'string' ? claims.picture : null)

  const existingUser = await findUserByFirebaseIdentity(claims.sub, email ?? undefined)

  if (existingUser) {
    const updates: {
      firebaseUid?: string
      email?: string
      name?: string | null
      image?: string | null
    } = {}

    if (existingUser.firebaseUid !== claims.sub) {
      updates.firebaseUid = claims.sub
    }
    if (email && existingUser.email !== email) {
      updates.email = email
    }
    if (name && existingUser.name !== name) {
      updates.name = name
    }
    if (image && existingUser.image !== image) {
      updates.image = image
    }

    if (Object.keys(updates).length > 0) {
      await adminDb.collection('users').doc(existingUser.id).update(updates)
      return { claims, user: { ...existingUser, ...updates } }
    }

    return { claims, user: existingUser }
  }

  if (!email) {
    throw new Error('Firebase account is missing an email address.')
  }

  const newUser = {
    firebaseUid: claims.sub,
    email,
    name,
    image,
    profileComplete: false,
    createdAt: new Date().toISOString(),
  }

  const userDoc = await adminDb.collection('users').add(newUser)
  return { claims, user: { id: userDoc.id, ...newUser } }
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(FIREBASE_SESSION_COOKIE)?.value

  if (!sessionToken) {
    return null
  }

  try {
    const { payload } = await jwtVerify(sessionToken, sessionSecret)
    const userId = typeof payload.userId === 'string' ? payload.userId : null

    if (!userId) {
      return null
    }

    const doc = await adminDb.collection('users').doc(userId).get()
    if (!doc.exists) return null

    return { id: doc.id, ...doc.data() } as any
  } catch {
    return null
  }
}

export async function createAppSessionToken(userId: string) {
  return new SignJWT({ userId } satisfies AppSessionPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${APP_SESSION_TTL_SECONDS}s`)
    .sign(sessionSecret)
}

export { APP_SESSION_TTL_SECONDS, FIREBASE_SESSION_COOKIE }
