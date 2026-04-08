import { getCurrentUser } from '@/lib/firebase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import DashboardClient, { type DBUser } from './DashboardClient'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser?.id) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      phone: true,
      address: true,
      idProofType: true,
      idProofNumber: true,
      idProofDocUrl: true,
      profileComplete: true,
      createdAt: true,
      listings: {
        orderBy: { createdAt: 'desc' }
      },
      messagesRecv: {
        where: { read: false }
      }
    },
  })

  if (!user?.profileComplete) {
    redirect('/onboarding')
  }

  return <DashboardClient user={user as unknown as DBUser} />
}
