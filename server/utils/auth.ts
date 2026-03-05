import { createAuthClient } from '@neondatabase/neon-js/auth';

// Na serveru musíme vždy použít absolutní URL
const neonAuthUrl = process.env.VITE_NEON_AUTH_URL || 'http://localhost:3000/auth';

export const serverAuth = createAuthClient(
  neonAuthUrl
);