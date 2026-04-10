import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/firebase/server'
import { adminDb } from '@/lib/firebase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, phone, address, idProofType, idProofNumber, idProofDocUrl } = body

  if (!name || !phone || !address || !idProofType || !idProofNumber || !idProofDocUrl) {
    return NextResponse.json({ error: 'All fields are required including ID proof upload.' }, { status: 400 })
  }

  const updateData = {
    name,
    phone,
    address,
    idProofType,
    idProofNumber,
    idProofDocUrl,
    profileComplete: true,
  }

  await adminDb.collection('users').doc(currentUser.id).update(updateData)

  return NextResponse.json({ success: true, user: { id: currentUser.id, ...updateData } })
}
