import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// AI Planner API using Gemini
app.post('/api/ai-plan', async (req, res) => {
  try {
    const { destination, days, transportMode, theme, customPrompt } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        fallback: true,
        message: 'No API key configured, using high-fidelity local itinerary database.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const promptText = `
你是一位熟悉台灣各縣市與外島在地文化的頂級旅遊規劃師兼美食行家。
請為用戶規劃一趟以「${destination}」為目的地、天數為「${days}天」、出行方式為「${transportMode}」、風格主題為「${theme}」的精緻深度旅遊。
用戶特別需求：「${customPrompt || '無特殊備註，請安排最道地熱門的特色體驗'}」。

請務必嚴格輸出合法的繁體中文 JSON 格式（不要使用 Markdown 代碼框或額外文字），JSON 格式結構如下：
{
  "title": "行程標題 (如：台南府城米其林與老城散策 2日行旅)",
  "summary": "整體行程精要亮點 (約100字)",
  "voiceScript": "一段適合用語音合成朗讀給旅客聽的親切簡要總結導覽詞 (約150字，語氣溫暖親切，包含核心景點與美食)",
  "totalBudgetEstimate": 4500,
  "packingAdvice": ["防曬乳", "悠遊卡", "雨具"],
  "transportAdvice": "大眾交通搭乘號碼、轉乘建議或自駕路線重點說明",
  "itinerary": [
    {
      "dayNumber": 1,
      "dayTitle": "Day 1 主題名稱",
      "summary": "當日摘要",
      "dailyBudgetEstimate": 2200,
      "dayFoodSummary": ["推薦美食1", "推薦美食2"],
      "spots": [
        {
          "name": "景點/店家名稱",
          "category": "attraction", // "attraction" | "food" | "stay" | "transport"
          "timeSlot": "09:30 - 11:30",
          "description": "亮點介紹",
          "address": "地址",
          "highlights": ["特點1", "特點2"],
          "foodDetail": {
            "signatureDish": "招牌必點菜餚",
            "priceRange": "NT$ 100 - 250",
            "mustTryReason": "必吃原因"
          },
          "transitFromPrev": {
            "mode": "${transportMode}",
            "lineName": "客運/捷運/路線號碼",
            "instructions": "如何搭乘或行駛指引",
            "durationMinutes": 20,
            "estimatedFare": "NT$ 25"
          }
        }
      ],
      "dayStay": {
        "name": "推薦民宿或飯店名稱",
        "category": "stay",
        "description": "住宿氛圍與特色",
        "address": "地址",
        "stayDetail": {
          "type": "hotel",
          "pricePerNight": "NT$ 2,800 - 3,800",
          "features": ["近車站", "附早餐", "海景/浴池"],
          "bookingAdvice": "預訂建議"
        }
      }
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text?.trim() || '{}';
    const parsedData = JSON.parse(jsonText);
    return res.json({ success: true, plan: parsedData });
  } catch (error: any) {
    console.error('Gemini AI plan error:', error);
    return res.status(200).json({
      fallback: true,
      error: error?.message || 'AI request failed, fallback applied',
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup Vite development server or serve static build
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
