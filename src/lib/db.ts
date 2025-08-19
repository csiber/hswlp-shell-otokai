import type { D1Database } from '@cloudflare/workers-types';

// Export the D1 binding from the global context
// TODO: consider more robust context handling if needed later
export const db = (globalThis as { DB: D1Database }).DB;
