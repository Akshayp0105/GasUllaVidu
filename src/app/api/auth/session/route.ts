import { NextRequest, NextResponse } from 'next/server'
import {
  APP_SESSION_TTL_SECONDS,
  createAppSessionToken,
  FIREBASE_SESSION_COOKIE,
  getCurrentUser,
  syncUserFromFirebaseToken,
} from '@/lib/firebase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const cookieOptions = {
  httpOnly: true,
  path: '/',
  sameSite: 'lax' as const, // Lax is generally better for oauth redirects
  secure: process.env.NODE_ENV === 'production', // Only secure in production (requires HTTPS)
  maxAge: APP_SESSION_TTL_SECONDS,
}

export async function GET() {
  const user = await getCurrentUser()
  return NextResponse.json({ authenticated: !!user, user })
}

export async function POST(req: NextRequest) {
  try {
    const { idToken, name, image } = await req.json()
    console.log('Session request received for token:', idToken?.substring(0, 20) + '...')

    if (typeof idToken !== 'string' || idToken.length === 0) {
      return NextResponse.json({ error: 'Missing Firebase ID token.' }, { status: 400 })
    }

    const { user } = await syncUserFromFirebaseToken(idToken, { name, image })
    const sessionToken = await createAppSessionToken(user.id)
    
    console.log('Session created for user:', user.id)

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        image: user.image,
        profileComplete: user.profileComplete,
      },
    })

    // Explicitly set cookie on the response object
    response.cookies.set(FIREBASE_SESSION_COOKIE, sessionToken, {
      ...cookieOptions,
      // Ensure we don't accidentally override the expiry
      expires: new Date(Date.now() + APP_SESSION_TTL_SECONDS * 1000),
    })

    return response
  } catch (error) {
    console.error('Failed to create Firebase session:', error)
    return NextResponse.json({ error: 'Unable to verify Firebase session.' }, { status: 401 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(FIREBASE_SESSION_COOKIE, '', {
    ...cookieOptions,
    maxAge: 0,
  })
  return response
}
