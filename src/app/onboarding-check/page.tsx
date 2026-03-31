import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

// This is a transparent redirect page that checks the profileComplete flag
// and routes the user to the right place
export default async function OnboardingCheckPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { profileComplete: true },
  })

  if (user?.profileComplete) {
    redirect('/dashboard')
  } else {
    redirect('/onboarding')
  }
}
