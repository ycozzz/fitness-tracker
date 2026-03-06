import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET() {
  try {
    const user = await getSession();
    
    if (!user) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }
    
    // Get profile
    const dbPath = path.join(process.cwd(), 'fitness.db');
    const db = new Database(dbPath);
    
    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id) as any;
    
    db.close();
    
    return NextResponse.json({
      user,
      profile
    });
    
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: '獲取用戶資料失敗' }, { status: 500 });
  }
}
