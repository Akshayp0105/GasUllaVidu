import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, phone, address, idProofType, idProofNumber, idProofDocUrl } = body

  if (!name || !phone || !address || !idProofType || !idProofNumber || !idProofDocUrl) {
    return NextResponse.json({ error: 'All fields are required including ID proof upload.' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
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
