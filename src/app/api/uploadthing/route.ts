import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function deprecatedResponse() {
  return NextResponse.json(
    { error: 'UploadThing has been removed. Use /api/profile/upload-document instead.' },
    { status: 410 }
  )
}

export async function GET() {
  return deprecatedResponse()
}

export async function POST() {
  return deprecatedResponse()
}
