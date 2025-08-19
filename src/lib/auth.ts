import { getSessionFromCookie } from '@/utils/auth';

// Retrieves the currently authenticated user from the session cookie
// Returns null if no session is found
export async function getUser() {
  const session = await getSessionFromCookie();
  return session?.user ?? null;
}
