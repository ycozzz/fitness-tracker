import { cookies } from 'next/headers';
import { getUserById, type User } from './auth';

const SESSION_COOKIE_NAME = 'fitness_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export async function createSession(userId: number): Promise<string> {
  const sessionId = `${userId}:${Date.now()}`;
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/'
  });
  
  return sessionId;
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!sessionId) return null;
  
  const [userIdStr] = sessionId.split(':');
  const userId = parseInt(userIdStr, 10);
  
  if (isNaN(userId)) return null;
  
  return getUserById(userId);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
