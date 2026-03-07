import type { H3Event } from 'h3'

export type AuthenticatedSession = {
  user: {
    id: string
    name: string | null
    email: string | null
  }
}

export async function getOptionalSession(event: H3Event): Promise<AuthenticatedSession | null> {
  const auth = typeof event.context.auth === 'function' ? event.context.auth() : event.context.auth;
  if (!auth || !auth.userId) {
    return null
  }

  // With Clerk, basic profile info isn't available synchronously in context without an API call,
  // but most endpoints just need the user ID, which maps to `supabaseAuthId` in our DB.
  return {
    user: {
      id: auth.userId,
      name: null,
      email: null,
    }
  }
}

export async function requireSession(event: H3Event): Promise<AuthenticatedSession> {
  const session = await getOptionalSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return session
}
