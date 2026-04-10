import { getCurrentUser } from '@/lib/firebase/server'
import { adminDb } from '@/lib/firebase/admin'
import { redirect } from 'next/navigation'

// This is a transparent redirect page that checks the profileComplete flag
// and routes the user to the right place
export default async function OnboardingCheckPage() {
  const currentUser = await getCurrentUser()
  console.log('Onboarding check - Current session user:', currentUser?.id || 'none')

  if (!currentUser?.id) {
    console.log('Onboarding check - No user, redirecting to sign-in')
    redirect('/auth/signin')
  }

  const userDoc = await adminDb.collection('users').doc(currentUser.id).get()
  const user = userDoc.exists ? userDoc.data() : null

  console.log('Onboarding check - User profile complete:', user?.profileComplete)

  if (user?.profileComplete) {
    console.log('Onboarding check - Redirecting to dashboard')
    redirect('/dashboard')
  } else {
    console.log('Onboarding check - Redirecting to onboarding')
    redirect('/onboarding')
  }
}
