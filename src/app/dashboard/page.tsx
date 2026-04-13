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

  const userDoc = await adminDb.collection('users').doc(currentUser.id).get()
  
  if (!userDoc.exists) {
    redirect('/auth/signin')
  }

  const userData = userDoc.data() as Omit<DBUser, 'id'>
  
  if (!userData?.profileComplete) {
    redirect('/onboarding')
  }

  const user: DBUser = {
    id: userDoc.id,
    ...userData,
  }

  return <DashboardClient user={user} />
}
