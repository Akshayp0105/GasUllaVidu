import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/firebase/server'
import { prisma } from '@/lib/prisma'

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

  const updated = await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      name,
      phone,
      address,
      idProofType,
      idProofNumber,
      idProofDocUrl,
      profileComplete: true,
    },
  })

  return NextResponse.json({ success: true, user: updated })
}
