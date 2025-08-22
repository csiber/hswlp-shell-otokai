import type { D1Database } from '@cloudflare/workers-types'; // relies on Cloudflare worker types

// Export the D1 binding from the global context
// TODO: consider more robust context handling if needed later
// TODO: ensure DB binding exists before access in production
export const db = (globalThis as unknown as { DB: D1Database }).DB;
