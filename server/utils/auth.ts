import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'
import * as schema from '../database/schema'

const googleClientId = process.env.GOOGLE_CLIENT_ID || ''
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || ''
const googleEnabled = Boolean(googleClientId && googleClientSecret)

const isProd = process.env.NODE_ENV === 'production'
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000'
const baseURL = process.env.BETTER_AUTH_URL || siteUrl

if (isProd && !process.env.BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET is required in production')
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins: Array.from(new Set([baseURL, siteUrl])),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  socialProviders: googleEnabled
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      }
    : undefined,
  user: {
    additionalFields: {
      phone: { type: 'string', required: false, defaultValue: null, input: false },
      street: { type: 'string', required: false, defaultValue: null, input: false },
      city: { type: 'string', required: false, defaultValue: null, input: false },
      zip: { type: 'string', required: false, defaultValue: null, input: false },
      role: { type: 'string', required: false, defaultValue: 'user', input: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,       // refresh every day
  },
  advanced: {
    useSecureCookies: isProd,
    defaultCookieAttributes: {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
    },
    cookies: {
      session_token: { name: 'shopik.session_token' },
    },
  },
})

export type Auth = typeof auth
