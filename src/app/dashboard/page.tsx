import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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

  return <DashboardClient user={user as any} />
}
