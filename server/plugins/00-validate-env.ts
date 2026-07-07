/**
 * Fail-fast validation of required environment variables in production.
 * Dev mode logs warnings but does not exit, so `nuxt dev` still starts.
 */
export default defineNitroPlugin(() => {
  const isProd = process.env.NODE_ENV === 'production'

  const required = [
    'DATABASE_URL',
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL',
    'NUXT_PUBLIC_SITE_URL',
  ]

  const recommended = [
    'NUXT_STRIPE_SECRET_KEY',
    'NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NUXT_PACKETA_API_SECRET',
    'NUXT_PUBLIC_PACKETA_API_KEY',
  ]

  const missing = required.filter((k) => !process.env[k])
  const missingRecommended = recommended.filter((k) => !process.env[k])

  if (missing.length) {
    const msg = `[env] Missing required environment variables: ${missing.join(', ')}`
    if (isProd) throw new Error(msg)
    console.warn(msg)
  }

  if (missingRecommended.length) {
    console.warn(
      `[env] Recommended environment variables not set: ${missingRecommended.join(', ')}`,
    )
  }

  if (isProd && process.env.BETTER_AUTH_SECRET && process.env.BETTER_AUTH_SECRET.length < 32) {
    throw new Error('[env] BETTER_AUTH_SECRET must be at least 32 characters in production')
  }
})
