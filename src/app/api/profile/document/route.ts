import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { getCurrentUser } from '@/lib/firebase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const currentUser = await getCurrentUser()
  if (!currentUser?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRef = adminDb.collection('users').doc(currentUser.id)
  const userDoc = await userRef.get()

  if (!userDoc.exists) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 })
  }

  const userData = userDoc.data() as {
    idProofDocName?: string
    idProofDocContentType?: string
    idProofDocChunkCount?: number
  }

  if (!userData.idProofDocName || !userData.idProofDocContentType) {
    return NextResponse.json({ error: 'No document uploaded.' }, { status: 404 })
  }

  const chunkSnapshot = await userRef.collection('idProofChunks').orderBy('index', 'asc').get()
  if (chunkSnapshot.empty) {
    return NextResponse.json({ error: 'No document data found.' }, { status: 404 })
  }

  const base64 = chunkSnapshot.docs.map((doc) => String(doc.get('data') ?? '')).join('')
  const buffer = Buffer.from(base64, 'base64')

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': userData.idProofDocContentType,
      'Content-Length': buffer.length.toString(),
      'Content-Disposition': `inline; filename="${userData.idProofDocName}"`,
      'Cache-Control': 'private, no-store, max-age=0',
    },
  })
}
