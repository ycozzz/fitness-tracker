import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mealType, foodName, calories, protein, carbs, fat, fiber, sugar, sodium, servingSize, imagePath } = body;
    
    const userId = 1; // Demo user
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    db.prepare(`
      INSERT INTO meals (user_id, meal_type, meal_date, meal_time, food_name, calories, protein, carbs, fat, fiber, sugar, sodium, serving_size, image_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, mealType, date, time, foodName, calories, protein, carbs, fat, fiber || 0, sugar || 0, sodium || 0, servingSize, imagePath);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const userId = 1;
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const meals = db.prepare(`
    SELECT * FROM meals WHERE user_id = ? AND meal_date = ? ORDER BY meal_time DESC
  `).all(userId, date);

  return NextResponse.json(meals);
}
