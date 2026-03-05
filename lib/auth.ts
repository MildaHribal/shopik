import { createAuthClient } from '@neondatabase/neon-js/auth';

const baseURL = import.meta.env.SSR
    ? (import.meta.env.BETTER_AUTH_URL || 'http://localhost:3000') + '/auth'
    : '/auth'

export const authClient = createAuthClient(baseURL)