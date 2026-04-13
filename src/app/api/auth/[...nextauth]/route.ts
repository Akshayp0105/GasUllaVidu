import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ error: 'NextAuth has been removed.' }, { status: 410 })
}

export async function POST() {
  return NextResponse.json({ error: 'NextAuth has been removed.' }, { status: 410 })
}
