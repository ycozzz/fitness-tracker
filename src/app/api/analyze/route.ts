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

    // Convert to base64 for API
    const base64Image = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';

    try {
      // Call OpenClaw API (Anthropic Claude with vision)
      const apiResponse = await fetch('https://aicanapi.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'sk-YzDCyWnsuYqG0yoRLQPGxDKKi2BPSSxJs3N8YbTlK0pNh5iE',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: base64Image
                }
              },
              {
                type: 'text',
                text: `請分析這張食物圖片，以 JSON 格式回覆（只回覆 JSON，不要其他文字）：
{
  "foodName": "食物名稱（繁體中文）",
  "calories": 卡路里數字,
  "protein": 蛋白質克數,
  "carbs": 碳水化合物克數,
  "fat": 脂肪克數,
  "fiber": 纖維克數,
  "sugar": 糖分克數,
  "sodium": 鈉毫克數,
  "servingSize": "份量描述",
  "confidence": 信心度0-1
}

請根據圖片中的食物估算營養成分。如果是多種食物，請合計總營養。`
              }
            ]
          }]
        })
      });

      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        const aiText = apiData.content[0].text;
        
        // Extract JSON from response
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          analysis.imagePath = `/uploads/${filename}`;
          return NextResponse.json(analysis);
        }
      }
    } catch (apiError) {
      console.error('AI API failed, using mock data:', apiError);
    }

    // Fallback: Return mock data when API fails
    const mockData = {
      foodName: '食物分析中...',
      calories: 350,
      protein: 15,
      carbs: 45,
      fat: 12,
      fiber: 5,
      sugar: 8,
      sodium: 400,
      servingSize: '1 份',
      confidence: 0.7,
      imagePath: `/uploads/${filename}`,
      note: '⚠️ AI 服務暫時不可用，顯示模擬數據'
    };

    return NextResponse.json(mockData);

  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json({ 
      error: '上傳失敗，請重試',
      details: error.message
    }, { status: 500 });
  }
}
