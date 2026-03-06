import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth';
import { createSession } from '@/lib/session';
import Database from 'better-sqlite3';
import path from 'path';
import { getNutritionTargets } from '@/lib/tdee';

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, profile } = await req.json();
    
    if (!username || !email || !password) {
      return NextResponse.json({ error: '請填寫所有必填欄位' }, { status: 400 });
    }
    
    if (!profile || !profile.gender || !profile.age || !profile.height || !profile.weight || !profile.activityLevel || !profile.goal) {
      return NextResponse.json({ error: '請完成個人資料設定' }, { status: 400 });
    }
    
    // Create user
    const user = createUser(username, email, password);
    
    // Calculate TDEE and targets
    const targets = getNutritionTargets({
      gender: profile.gender,
      age: profile.age,
      height: profile.height,
      weight: profile.weight,
      activityLevel: profile.activityLevel,
      goal: profile.goal
    });
    
    // Create profile
    const dbPath = path.join(process.cwd(), 'fitness.db');
    const db = new Database(dbPath);
    
    db.prepare(`
      INSERT INTO profiles (
        user_id, gender, age, height, weight,
        activity_level, goal, tdee, calorie_target,
        protein_target, carbs_target, fat_target
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      user.id,
      profile.gender,
      profile.age,
      profile.height,
      profile.weight,
      profile.activityLevel,
      profile.goal,
      targets.calories, // TDEE before adjustment
      targets.calories,
      targets.protein,
      targets.carbs,
      targets.fat
    );
    
    db.close();
    
    // Create session
    await createSession(user.id);
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      targets
    });
    
  } catch (error: any) {
    console.error('Register error:', error);
    
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: '用戶名或電郵已被使用' }, { status: 409 });
    }
    
    return NextResponse.json({ error: '註冊失敗' }, { status: 500 });
  }
}
