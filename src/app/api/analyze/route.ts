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
      // Call OpenRouter API (Claude with vision)
      const apiResponse = await fetch('https://openrouter.vip/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-jWoK0t2XWevNZ8mvlgGQ7CLTsWREj73Vb4FbbPJdXDbSPR6v',
          'User-Agent': 'Mozilla/5.0'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              },
              {
                type: 'text',
                text: `請分析這張食物圖片，以 JSON 格式回覆（只回覆 JSON，不要其他文字）：

如果圖片中有多種食物，請用以下格式：
{
  "foodName": "食物1 + 食物2",
  "items": [
    {
      "name": "食物1名稱（繁體中文）",
      "calories": 單份卡路里數字,
      "protein": 單份蛋白質克數,
      "carbs": 單份碳水化合物克數,
      "fat": 單份脂肪克數,
      "fiber": 單份纖維克數,
      "sugar": 單份糖分克數,
      "sodium": 單份鈉毫克數,
      "servingSize": "份量描述",
      "quantity": 數量,
      "unit": "單位（份/隻/碗/塊/件）",
      "countable": true或false（是否可數，例如雞翼=true，飯=false）
    },
    {
      "name": "食物2名稱（繁體中文）",
      "calories": 單份卡路里數字,
      "protein": 單份蛋白質克數,
      "carbs": 單份碳水化合物克數,
      "fat": 單份脂肪克數,
      "fiber": 單份纖維克數,
      "sugar": 單份糖分克數,
      "sodium": 單份鈉毫克數,
      "servingSize": "份量描述",
      "quantity": 數量,
      "unit": "單位（份/隻/碗/塊/件）",
      "countable": true或false
    }
  ],
  "calories": 總卡路里,
  "protein": 總蛋白質,
  "carbs": 總碳水,
  "fat": 總脂肪,
  "fiber": 總纖維,
  "sugar": 總糖分,
  "sodium": 總鈉,
  "servingSize": "總份量描述",
  "confidence": 信心度0-1,
  "aiComment": "用廣東話毒舌評論這餐（例如：嘩，成碟油，你今晚準備跑10K啦！）"
}

如果只有一種食物，請用以下格式：
{
  "foodName": "食物名稱（繁體中文）",
  "items": [
    {
      "name": "食物名稱（繁體中文）",
      "calories": 單份卡路里數字,
      "protein": 單份蛋白質克數,
      "carbs": 單份碳水化合物克數,
      "fat": 單份脂肪克數,
      "fiber": 單份纖維克數,
      "sugar": 單份糖分克數,
      "sodium": 單份鈉毫克數,
      "servingSize": "份量描述",
      "quantity": 數量,
      "unit": "單位（份/隻/碗/塊/件）",
      "countable": true或false
    }
  ],
  "calories": 卡路里數字,
  "protein": 蛋白質克數,
  "carbs": 碳水化合物克數,
  "fat": 脂肪克數,
  "fiber": 纖維克數,
  "sugar": 糖分克數,
  "sodium": 鈉毫克數,
  "servingSize": "份量描述",
  "confidence": 信心度0-1,
  "aiComment": "用廣東話毒舌評論這餐"
}

重要規則：
1. 如果是可數食物（雞翼、餃子、壽司等），設 countable=true，unit="隻"或"件"或"粒"
2. 如果是不可數食物（飯、麵、湯等），設 countable=false，unit="份"或"碗"
3. calories/protein等數值是「單份/單隻」的營養，不是總量
4. quantity 是圖片中看到的數量（例如：3隻雞翼 → quantity=3）
5. 廣東話評論要幽默、毒舌、貼地，根據食物健康程度給予不同評價

請根據圖片中的食物估算營養成分。`
              }
            ]
          }],
          max_tokens: 2048
        })
      });

      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        const aiText = apiData.choices[0].message.content;
        
        // Extract JSON from response
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          analysis.imagePath = `/uploads/${filename}`;
          console.log('✅ AI Analysis successful:', analysis.foodName);
          console.log('💬 AI Comment:', analysis.aiComment);
          return NextResponse.json(analysis);
        }
      } else {
        const errorText = await apiResponse.text();
        console.error('API Error:', apiResponse.status, errorText);
      }
    } catch (apiError: any) {
      console.error('AI API failed:', apiError.message);
    }

    // Fallback: Return mock data when API fails
    console.log('⚠️ Using mock data fallback');
    const mockData = {
      foodName: '食物分析中...',
      items: [
        {
          name: '食物分析中...',
          calories: 350,
          protein: 15,
          carbs: 45,
          fat: 12,
          fiber: 5,
          sugar: 8,
          sodium: 400,
          servingSize: '1 份',
          quantity: 1,
          unit: '份',
          countable: false
        }
      ],
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
      note: '⚠️ AI 服務暫時不可用，顯示模擬數據',
      aiComment: '等陣先，AI 瞓緊覺，遲啲再嚟啦！'
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
