import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/firebase/server'
import { adminDb } from '@/lib/firebase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 4 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'application/pdf'])
const CHUNK_SIZE = 300_000

function getFileExtension(fileName: string, mimeType: string) {
  const byMimeType: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'application/pdf': 'pdf',
  }

  const explicitExtension = fileName.split('.').pop()?.toLowerCase()
  if (explicitExtension && ['jpg', 'jpeg', 'png', 'pdf'].includes(explicitExtension)) {
    return explicitExtension === 'jpeg' ? 'jpg' : explicitExtension
  }

  return byMimeType[mimeType] || 'bin'
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, and PDF files are allowed.' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size must be 4MB or less.' }, { status: 400 })
    }

    const extension = getFileExtension(file.name, file.type)
    const safeBaseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 60) || 'document'
    const storedFileName = `${safeBaseName}.${extension}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')
    const chunks = base64.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'g')) ?? []
    const userRef = adminDb.collection('users').doc(currentUser.id)
    const chunksRef = userRef.collection('idProofChunks')
    const existingChunks = await chunksRef.get()
    const batch = adminDb.batch()

    existingChunks.docs.forEach((doc) => batch.delete(doc.ref))

    chunks.forEach((chunk, index) => {
      const chunkRef = chunksRef.doc(index.toString().padStart(4, '0'))
      batch.set(chunkRef, {
        index,
        data: chunk,
      })
    })

    batch.set(
      userRef,
      {
        idProofDocUrl: '/api/profile/document',
        idProofDocName: storedFileName,
        idProofDocContentType: file.type,
        idProofDocSize: file.size,
        idProofDocEncoding: 'base64-chunked',
        idProofDocChunkCount: chunks.length,
        idProofDocUpdatedAt: new Date().toISOString(),
      },
      { merge: true }
    )

    await batch.commit()

    return NextResponse.json({
      success: true,
      url: '/api/profile/document',
      fileName: storedFileName,
      contentType: file.type,
      size: file.size,
      chunkCount: chunks.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed unexpectedly.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
