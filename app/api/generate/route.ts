import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, gender, style, userToken } = body;

    if (!userToken || userToken !== process.env.MY_SECRET_TOKEN) {
      return NextResponse.json({ error: "Invalid Access Token!" }, { status: 403 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" }, // 안정적인 JSON 출력을 위해 유지
        messages: [
          {
            role: "system",
            content: `당신은 세계 최고의 한국 성명학 전문가입니다.
              
              [작명 및 설명 가이드라인]
              1. **형식**: 반드시 성(1자) + 이름(2자) 조합의 [총 3글자] 한국인 이름을 반드시 [3개]를 추천하세요.
              2. **음절 단위 매칭**: 사용자의 Full Name 발음을 한국어 음절로 쪼개어, 가장 비슷한 소리가 나는 '한국 실존 성씨'와 '한국 실존 이름'을 조합하세요.
                 - 예: Donald Johns Trump -> 도준표
              3. **상세 의미(Meaning) 구성**: 
                 - 반드시 영어(English)로 작성하세요. (한국어 사용 절대 금지)
                 - 이름의 각 음절이 사용자 이름의 어떤 부분에서 왔는지, 그리고 한자 의미를 포함해 설명하세요.
              4. **추천 이유(Why)**: 
                 - 반드시 영어(English)로 작성하세요. (한국어 사용 절대 금지)
                 - 발음의 유사성과 한국적 자연스러움을 설명하세요.
              5. **성별 처리**: 성별이 'Choose not to specify'인 경우 중성적이고 세련된 이름을 추천하세요.

              출력 형식은 반드시 "results"라는 키 안에 kName, roman, meaning, why 키를 가진 JSON 배열을 담아서 보내세요.`
          },
          { role: "user", content: `Name: ${fullName}, Gender: ${gender}, Style: ${style}` }
        ],
        temperature: 0.8
      })
    });

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    return NextResponse.json(content.results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}