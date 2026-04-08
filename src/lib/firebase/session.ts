type SessionProfile = {
  name?: string | null
  image?: string | null
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

export async function syncFirebaseSession(idToken: string, profile?: SessionProfile) {
  const delays = [0, 250, 750]
  let lastError: Error | null = null

  for (const delay of delays) {
    if (delay > 0) {
      await wait(delay)
    }

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
  }

  throw lastError ?? new Error('Unable to start your session.')
}

export async function clearFirebaseSession() {
  await fetch('/api/auth/session', { method: 'DELETE' })
}
