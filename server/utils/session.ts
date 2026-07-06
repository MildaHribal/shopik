import type { H3Event } from 'h3'
import { getHeaders } from 'h3'
import { auth } from './auth'

export type AppSession = {
  user: {
    id: string
    name: string | null
    email: string | null
    role?: string
  }
} | null

function toHeaders(event: H3Event): Headers {
  const raw = getHeaders(event)
  const h = new Headers()
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'string') h.set(k, v)
  }
  return h
}

export async function getOptionalSession(event: H3Event): Promise<AppSession> {
  try {
    const result = await auth.api.getSession({ headers: toHeaders(event) })
    if (!result?.user) return null
    return {
      user: {
        id: result.user.id,
        name: result.user.name ?? null,
        email: result.user.email ?? null,
        role: (result.user as any).role ?? 'user',
      },
    }
  } catch (err) {
    console.error('getOptionalSession error:', err)
    return null
  }
}

export type AuthenticatedSession = {
  user: {
    id: string
    name: string | null
    email: string | null
    role?: string
  }
}

export async function requireSession(event: H3Event): Promise<AuthenticatedSession> {
  const session = await getOptionalSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return session
}

export async function requireAdmin(event: H3Event): Promise<AuthenticatedSession> {
  const session = await requireSession(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  return session
}
