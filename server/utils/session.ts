import type { H3Event } from 'h3'
import { getRequestHeaders } from 'h3'
import { getSupabaseAdmin } from './auth'

type SupabaseSession = {
  user?: {
    id?: string
    name?: string | null
    email?: string | null
  }
} | null

async function fetchSupabaseSession(event: H3Event): Promise<SupabaseSession> {
  const headers = getRequestHeaders(event)
  const authHeader = headers['authorization'] || headers['Authorization']

  // Try to get token from Authorization header or cookie
  let token = ''
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7)
  } else {
    // Parse sb-access-token from cookies
    const cookieHeader = headers['cookie'] || ''
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [key, ...val] = c.trim().split('=')
        return [key, val.join('=')]
      })
    )
    token = cookies['sb-access-token'] || ''
  }

  if (!token) return null

  try {
    const supabase = getSupabaseAdmin()
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) return null

    return {
      user: {
        id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        email: user.email || null,
      }
    }
  } catch (err) {
    console.error('Session error:', err)
    return null
  }
}

export async function getOptionalSession(event: H3Event): Promise<SupabaseSession> {
  try {
    return await fetchSupabaseSession(event)
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
