import { getCurrentUser } from '@/lib/firebase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

// This is a transparent redirect page that checks the profileComplete flag
// and routes the user to the right place
export default async function OnboardingCheckPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser?.id) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { profileComplete: true },
  })

  if (user?.profileComplete) {
    redirect('/dashboard')
  } else {
    redirect('/onboarding')
  }
}
