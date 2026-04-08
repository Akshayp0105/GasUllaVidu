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
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: APP_SESSION_TTL_SECONDS,
}

export async function GET() {
  const user = await getCurrentUser()
  return NextResponse.json({ authenticated: !!user, user })
}

export async function POST(req: NextRequest) {
  try {
    const { idToken, name, image } = await req.json()

    if (typeof idToken !== 'string' || idToken.length === 0) {
      return NextResponse.json({ error: 'Missing Firebase ID token.' }, { status: 400 })
    }

    const { user } = await syncUserFromFirebaseToken(idToken, { name, image })
    const sessionToken = await createAppSessionToken(user.id)
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

    response.cookies.set(FIREBASE_SESSION_COOKIE, sessionToken, cookieOptions)
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
