import { getCurrentUser } from '@/lib/firebase/server'
import { adminDb } from '@/lib/firebase/admin'
import { redirect } from 'next/navigation'
import DashboardClient, { type DBUser } from './DashboardClient'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser?.id) {
    redirect('/auth/signin')
  }

  // Use parallel fetching if needed, but here we just sequentially fetch
  // to replicate the previous Prisma unified query loosely.
  const userDoc = await adminDb.collection('users').doc(currentUser.id).get()
  
  if (!userDoc.exists) {
    redirect('/auth/signin')
  }

  const userData = userDoc.data()
  
  if (!userData?.profileComplete) {
    redirect('/onboarding')
  }

  // Fetch listings (orderBy createdAt desc)
  const listingsSnapshot = await adminDb
    .collection('listings')
    .where('userId', '==', currentUser.id)
    .orderBy('createdAt', 'desc')
    .get()

  const listings = listingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  // Fetch unread received messages
  const messagesSnapshot = await adminDb
    .collection('messages')
    .where('receiverId', '==', currentUser.id)
    .where('read', '==', false)
    .get()

  const messagesRecv = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  const user = {
    id: userDoc.id,
    ...userData,
    listings,
    messagesRecv,
  }

  return <DashboardClient user={user as unknown as DBUser} />
}
