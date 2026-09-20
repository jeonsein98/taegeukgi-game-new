import { GoogleGenAI, Type } from '@google/genai';

// Next.js App Router Route Handler: POST /api/gemini
// ⚠️ 보안 규칙: GEMINI_API_KEY는 서버 라우트에서만 사용되며 클라이언트에 노출되지 않습니다.
export const runtime = 'nodejs';

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

const FALLBACK_QUIZZES = [
  {
    question: "태극기 가운데의 빨간색은 존귀함과 밝은 하늘의 기운을 뜻해요. 맞을까요?",
    answer: "O",
    explanation: "정답이에요! 빨간색은 양(陽)을 뜻하며 존귀함과 밝음을 나타내요.",
    funFact: "태극기는 흰색 바탕, 빨강·파랑 태극, 그리고 4개의 괘(건·곤·감·리)로 이루어져 있어요!"
  },
  {
    question: "태극기 왼쪽 위의 '건괘'는 땅(흙)을 나타내는 기운이에요. 맞을까요?",
    answer: "X",
    explanation: "건괘는 '하늘(天)'을 나타내요! 땅을 나타내는 것은 오른쪽 아래의 '곤괘'랍니다.",
    funFact: "건괘는 끊어지지 않은 긴 선 3개(☰)로 그려요."
  },
  {
    question: "태극기의 하얀색 바탕은 평화를 사랑하는 우리 민족의 순수한 마음을 나타내요. 맞을까요?",
    answer: "O",
    explanation: "맞아요! 예로부터 백의민족이라 불렸던 우리의 깨끗하고 밝은 마음을 뜻해요.",
    funFact: "흰색 바탕 덕분에 태극과 4괘가 더욱 선명하고 아름답게 보여요."
  },
  {
    question: "태극기 오른쪽 위의 '감괘'는 불(火)을 나타내는 기운이에요. 맞을까요?",
    answer: "X",
    explanation: "감괘는 '물(水)'을 나타내요! 불(火)을 나타내는 것은 왼쪽 아래의 '리괘'예요.",
    funFact: "물과 불, 하늘과 땅이 서로 어우러져 조화로운 세상을 뜻해요."
  }
];

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { studentName = '친구', timeSpentSeconds = 30, mode = 'drag' } = body;
    const safeName = String(studentName).trim().slice(0, 30) || '친구';
    const modeText = mode === 'click' ? '특수유아 터치 클릭 모드' : '기본 드래그앤드롭 모드';
    const formattedTime = `${Math.floor(Number(timeSpentSeconds) / 60)}분 ${Number(timeSpentSeconds) % 60}초`;

    const ai = getGenAI();

    if (ai) {
      const prompt = `
당신은 대한민국 유아 및 특수교육 대상 학생들을 격려하는 친절하고 다정한 초등학교/유치원 선생님입니다.
학생 이름: "${safeName}"
학생이 "${modeText}"로 태극기 퍼즐(태극 상단 빨강, 태극 하단 파랑, 4괘: 건·곤·감·리)을 소요 시간 ${formattedTime}만에 멋지게 완성했습니다!

다음 2가지를 한국어로 정성껏 작성하여 JSON 형식으로 응답해 주세요:
1. praiseMessage: "${safeName}" 학생의 이름을 직접 부르며, 태극기의 소중한 조각을 스스로 멋지게 완성한 것을 크게 칭찬하고 자신감을 듬뿍 주는 따뜻한 칭찬 메시지 (2~3문장, 이모지 포함).
2. quiz: 어린이나 특수학급 학생도 쉽게 이해할 수 있는 매우 친절하고 쉬운 태극기 상식 O/X 퀴즈 1개
   - question: 질문 내용 ("~맞으면 O, 틀리면 X를 골라보세요!")
   - answer: 반드시 대문자 "O" 또는 "X"
   - explanation: 왜 정답인지 1~2문장의 따뜻한 쉬운 해설
   - funFact: 태극기와 관련된 재미있고 쉬운 1문장 상식
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
              quiz: {
                type: Type.OBJECT,
                properties: {
                  question: {
                    type: Type.STRING,
                    description: '유아/특수교육용 쉬운 OX 퀴즈 질문',
                  },
                  answer: {
                    type: Type.STRING,
                    description: '"O" 또는 "X"',
                  },
                  explanation: {
                    type: Type.STRING,
                    description: '정답 설명',
                  },
                  funFact: {
                    type: Type.STRING,
                    description: '태극기 상식 팁',
                  },
                },
                required: ['question', 'answer', 'explanation'],
              },
            },
            required: ['praiseMessage', 'quiz'],
          },
        },
      });

      const text = response.text;
      if (text) {
        return new Response(
          JSON.stringify({
            success: true,
            data: JSON.parse(text),
            source: 'gemini-ai',
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
    }

    // Fallback response
    const randomFallback = FALLBACK_QUIZZES[Math.floor(Math.random() * FALLBACK_QUIZZES.length)];
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          praiseMessage: `우리 ${safeName} 학생, 정말 대견하고 멋져요! 🌟 태극기의 빨강·파랑 태극과 건·곤·감·리 4괘를 모두 알맞은 자리에 척척 맞추었네요! 우리나라를 사랑하는 ${safeName}이의 반짝이는 마음이 느껴져요. 참 잘했어요! 👍✨`,
          quiz: randomFallback,
        },
        source: 'educational-fallback',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Next.js API route error:', error);
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          praiseMessage: '우리 친구, 태극기를 끝까지 완성해 낸 멋진 끈기와 집중력에 큰 박수를 보냅니다! 👏 대한민국 태극기 박사님으로 임명해요! 🇰🇷',
          quiz: FALLBACK_QUIZZES[0],
        },
        source: 'safety-fallback',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
}
