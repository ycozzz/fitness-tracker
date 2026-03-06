import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, verifyPassword } from '@/lib/auth';
import { createSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return NextResponse.json({ error: '請輸入用戶名和密碼' }, { status: 400 });
    }
    
    const user = getUserByUsername(username);
    
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: '用戶名或密碼錯誤' }, { status: 401 });
    }
    
    await createSession(user.id);
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
    
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: '登入失敗' }, { status: 500 });
  }
}
