import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Save image
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(process.cwd(), 'uploads', filename);
    await writeFile(filepath, buffer);

    // Mock AI analysis (replace with real AI API)
    // In production, use Google Gemini Vision or OpenAI GPT-4 Vision
    const mockAnalysis = {
      foodName: '雞胸肉配糙米飯',
      calories: 450,
      protein: 35,
      carbs: 52,
      fat: 8,
      fiber: 4,
      sugar: 2,
      sodium: 320,
      servingSize: '1 份 (約 300g)',
      confidence: 0.85,
      imagePath: `/uploads/${filename}`
    };

    return NextResponse.json(mockAnalysis);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
