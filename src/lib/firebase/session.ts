type SessionProfile = {
  name?: string | null
  image?: string | null
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

export async function syncFirebaseSession(idToken: string, profile?: SessionProfile) {
  let lastError: Error | null = null

  // We perform a single retry if the initial attempt fails due to a transient network error
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
          name: profile?.name ?? null,
          image: profile?.image ?? null,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (response.ok) {
        return data
      }

      lastError = new Error(
        typeof data?.error === 'string' ? data.error : 'Unable to start your session.'
      )
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Network error during session sync.')
    }
  }

  throw lastError ?? new Error('Unable to start your session.')
}

export async function clearFirebaseSession() {
  await fetch('/api/auth/session', { method: 'DELETE' })
}
