import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json({ error: 'This route has been replaced by Firebase Auth.' }, { status: 410 })
}
