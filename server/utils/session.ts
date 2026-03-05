import type { H3Event } from 'h3'
import { getRequestHeaders } from 'h3'
import { serverAuth } from './auth'

type NeonSession = {
  user?: {
    id?: string
    name?: string | null
    email?: string | null
  }
} | null

async function fetchNeonSession(event: H3Event): Promise<NeonSession> {
  const headers = getRequestHeaders(event) as HeadersInit
  const sessionData = await serverAuth.getSession({
    fetchOptions: { headers }
  })

  // Neon Auth client sometimes wraps payload in { data }
  return (sessionData as any && 'data' in (sessionData as any))
    ? (sessionData as any).data
    : (sessionData as any)
}

export async function getOptionalSession(event: H3Event): Promise<NeonSession> {
  try {
    return await fetchNeonSession(event)
  } catch {
    return null
  }
}

export type AuthenticatedSession = {
  user: {
    id: string
    name: string | null
    email: string | null
  }
}

export async function requireSession(event: H3Event): Promise<AuthenticatedSession> {
  const session = await getOptionalSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return {
    user: {
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
    }
  }
}

