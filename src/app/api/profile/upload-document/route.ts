import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/firebase/server'
import { adminStorage } from '@/lib/firebase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 4 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'application/pdf'])

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

  const bucket = adminStorage.bucket()
  const extension = getFileExtension(file.name, file.type)
  const safeBaseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 60) || 'document'
  const objectPath = `id-proofs/${currentUser.id}/${Date.now()}-${safeBaseName}.${extension}`
  const storageFile = bucket.file(objectPath)
  const buffer = Buffer.from(await file.arrayBuffer())

  await storageFile.save(buffer, {
    resumable: false,
    contentType: file.type,
    metadata: {
      cacheControl: 'private, max-age=31536000',
      metadata: {
        userId: currentUser.id,
      },
    },
  })

  const [url] = await storageFile.getSignedUrl({
    action: 'read',
    expires: '2500-01-01',
  })

  return NextResponse.json({
    success: true,
    url,
    path: objectPath,
    contentType: file.type,
    size: file.size,
  })
}
