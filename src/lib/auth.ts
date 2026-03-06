import crypto from 'crypto';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'fitness.db');

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export interface User {
  id: number;
  username: string;
  email: string;
  display_name?: string;
  created_at: string;
}

export function getUserByUsername(username: string): (User & { password_hash: string }) | null {
  const db = new Database(dbPath);
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
  db.close();
  return user || null;
}

export function getUserById(id: number): User | null {
  const db = new Database(dbPath);
  const user = db.prepare('SELECT id, username, email, display_name, created_at FROM users WHERE id = ?').get(id) as any;
  db.close();
  return user || null;
}

export function createUser(username: string, email: string, password: string): User {
  const db = new Database(dbPath);
  const passwordHash = hashPassword(password);
  
  const result = db.prepare(`
    INSERT INTO users (username, email, password_hash)
    VALUES (?, ?, ?)
  `).run(username, email, passwordHash);
  
  const user = getUserById(result.lastInsertRowid as number);
  db.close();
  
  if (!user) throw new Error('Failed to create user');
  return user;
}
