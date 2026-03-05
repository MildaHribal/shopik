import { createAuthClient } from '@neondatabase/neon-js/auth';

// Server-side Neon Auth client for session verification
export const serverAuth = createAuthClient(
    process.env.VITE_NEON_AUTH_URL!
);