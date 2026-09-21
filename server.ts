import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google Gemini AI client lazily
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Fallback high-quality educational praise if Gemini API key is missing or network fails
const FALLBACK_PRAISES = [
  '태극기의 빨강·파랑 태극과 건·곤·감·리 4괘를 모두 알맞은 자리에 척척 맞추었네요! 우리나라를 사랑하는 반짝이는 마음이 느껴져요. 참 잘했어요! 👍✨',
  '태극기를 끝까지 완성해 낸 멋진 끈기와 집중력에 큰 박수를 보냅니다! 👏 대한민국 태극기 박사님으로 임명해요! 🇰🇷',
  '어려운 조각들도 차근차근 맞추어 멋진 태극기를 완성했어요! 스스로 해낸 우리 학생, 정말 대견하고 자랑스러워요! 🌟',
];

// Backend Gemini API route: POST /api/gemini
app.post('/api/gemini', async (req: Request, res: Response): Promise<void> => {
  const { studentName = '친구', timeSpentSeconds = 30, mode = 'drag' } = req.body;
  const safeName = String(studentName).trim().slice(0, 30) || '친구';
  const modeText =
    mode === 'level1' || mode === 'click'
      ? '1단계: 터치 모드'
      : mode === 'level3'
      ? '3단계: 괘 조립 모드 (건곤감리의 긴 막대·짧은 막대 하나하나 조립)'
      : '2단계: 드래그 모드';
  const formattedTime = `${Math.floor(Number(timeSpentSeconds) / 60)}분 ${Number(timeSpentSeconds) % 60}초`;

  try {
    const ai = getGenAI();

    if (ai) {
      const prompt = `
당신은 대한민국 학생들을 격려하는 친절하고 다정한 선생님입니다.
학생 이름: "${safeName}"
학생이 "${modeText}"로 태극기 퍼즐(태극 상단 빨강, 태극 하단 파랑, 4괘: 건·곤·감·리)을 소요 시간 ${formattedTime}만에 멋지게 완성했습니다!

다음 항목을 한국어로 정성껏 작성하여 JSON 형식으로 응답해 주세요:
- praiseMessage: "${safeName}" 학생의 이름을 직접 부르며, 태극기의 소중한 조각을 스스로 멋지게 완성한 것을 크게 칭찬하고 자신감을 듬뿍 주는 따뜻한 칭찬 메시지 (2~3문장, 이모지 포함).
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              praiseMessage: {
                type: Type.STRING,
                description: '학생을 향한 따뜻한 격려와 칭찬의 한마디',
              },
            },
            required: ['praiseMessage'],
          },
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        res.json({
          success: true,
          data: parsed,
          source: 'gemini-ai',
        });
        return;
      }
    }

    // Fallback if AI client not configured or empty response
    const randomPraise = FALLBACK_PRAISES[Math.floor(Math.random() * FALLBACK_PRAISES.length)];
    const fallbackPraise = `우리 ${safeName} 학생, 정말 대견하고 멋져요! 🌟 ${randomPraise}`;

    res.json({
      success: true,
      data: {
        praiseMessage: fallbackPraise,
      },
      source: 'educational-fallback',
    });
  } catch (error) {
    console.error('Gemini API Route Error:', error);
    res.json({
      success: true,
      data: {
        praiseMessage: `우리 ${safeName} 학생, 태극기를 끝까지 완성해 낸 멋진 끈기와 집중력에 박수를 보냅니다! 👏 대한민국 태극기 박사님으로 임명해요! 🇰🇷`,
      },
      source: 'safety-fallback',
    });
  }
});

// Google Apps Script Proxy Route: POST /api/gas
// Helps prevent client-side CORS issues when posting student completion records to Google Apps Script Web App
app.post('/api/gas', async (req: Request, res: Response): Promise<void> => {
  const targetUrl = req.body.gasUrl || process.env.NEXT_PUBLIC_GAS_URL;

  if (!targetUrl) {
    res.status(400).json({
      success: false,
      message: 'NEXT_PUBLIC_GAS_URL 환경변수 또는 gasUrl 파라미터가 설정되지 않았습니다.',
    });
    return;
  }

  try {
    const payload = {
      studentName: req.body.studentName || '이름 없음',
      elapsedSeconds: req.body.elapsedSeconds || 0,
      mode: req.body.mode || '기본 모드',
      praiseMessage: req.body.praiseMessage || '',
      timestamp: new Date().toISOString(),
    };

    const gasResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    res.json({
      success: true,
      status: gasResponse.status,
      message: '구글 스프레드시트로 학생 학습 기록이 성공적으로 전송되었습니다!',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.warn('GAS Proxy warning:', errorMsg);
    res.json({
      success: false,
      message: `구글 시트 연동 전송 중 알림: ${errorMsg}. (URL을 확인해 주세요)`,
    });
  }
});

// Server health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'taegeukgi-game-server' });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Taegeukgi Server] running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
