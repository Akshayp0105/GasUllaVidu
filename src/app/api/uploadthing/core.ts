import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { getCurrentUser } from '@/lib/firebase/server'

const f = createUploadthing()

export const ourFileRouter = {
  idProofUploader: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
    pdf: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser?.id) throw new Error('Unauthorized')
      return { userId: currentUser.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId)
      console.log('File URL:', file.url)
      return { uploadedBy: metadata.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
