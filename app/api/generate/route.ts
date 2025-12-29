import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, gender, nationality, style, userToken } = body;

    // 클라이언트에서 보낸 토큰이 서버의 마스터 토큰과 일치해야만 진행
    if (!userToken || userToken !== process.env.MY_SECRET_TOKEN) {
      return NextResponse.json({ error: "Invalid Access Token!" }, { status: 403 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      // ... 기존 상단 코드 동일

      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `당신은 세계 최고의 한국 성명학 전문가입니다.
              
              [작명 및 설명 가이드라인]
              1. **형식**: 반드시 성(1자) + 이름(2자) 조합의 [총 3글자] 한국인 이름을 반드시 [3개]를 추천하세요.
              2. **음절 단위 매칭**: 사용자의 Full Name 발음을 한국어 음절로 쪼개어, 가장 비슷한 소리가 나는 '한국 실존 성씨'와 '한국 실존 이름'을 조합하세요.
                 - 예: Donald Johns Trump -> Donald와 비슷한 '도(Do)' + Johns와 비슷한 '준(Jun)' + Trump와 비슷한 이름 '표(Pyo)' = 도준표
              3. **상세 의미(Meaning) 구성**: 
                 - 반드시 사용자의 국적(${nationality}) 언어로 작성하세요. (한국어 사용 절대 금지)
                 - 이름의 각 음절이 사용자 이름의 어떤 부분에서 왔는지, 그리고 한자 의미를 포함해 설명하세요.
              4. **추천 이유(Why)**: 발음의 유사성과 한국적 자연스러움을 국적(${nationality}) 언어로 설명하세요.
              5. **성별 처리**: 성별이 'Choose not to specify'인 경우 중성적이고 세련된 이름을 추천하세요.

              출력 형식은 반드시 kName, roman, meaning, why 키를 가진 JSON 배열이어야 합니다.`
          },
          { role: "user", content: `Name: ${fullName}, Gender: ${gender}, Nationality: ${nationality}, Style: ${style}` }
        ],
        temperature: 0.8
      })
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}