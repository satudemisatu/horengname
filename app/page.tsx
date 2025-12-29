"use client";

import { useState, useEffect } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    fullName: '', 
    gender: 'Male', 
    nationality: 'USA', 
    style: 'Trendy', 
    userToken: ''
  });
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0); 
  const MAX_LIMIT = 3;

  // 기회가 남았을 때 자동으로 사용할 마스터 토큰 저장
  const [activeToken, setActiveToken] = useState<string | null>(null);

  useEffect(() => {
    const savedCount = localStorage.getItem('kname_usage_count');
    const savedToken = localStorage.getItem('kname_active_token');
    if (savedCount) setUsageCount(parseInt(savedCount));
    if (savedToken) setActiveToken(savedToken);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

// ... 상단 생략

const speak = (text: string) => {
  if (typeof window !== 'undefined') {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // 1. 브라우저가 제공하는 모든 목소리 리스트 가져오기
    const voices = window.speechSynthesis.getVoices();
    
    // 2. 가장 자연스러운 한국어 목소리 순위 매기기
    // 'Google 한국어' 또는 'Apple Yuna' 같은 목소리가 보통 가장 자연스럽습니다.
    const preferredVoice = 
      voices.find(v => v.name.includes('Google') && v.lang === 'ko-KR') || 
      voices.find(v => v.name.includes('Yuna') && v.lang === 'ko-KR') || 
      voices.find(v => v.lang === 'ko-KR' || v.lang === 'ko_KR');

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.lang = 'ko-KR';
    utterance.rate = 0.9; // 속도를 아주 살짝 낮추면 훨씬 인간처럼 들립니다.
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
  }
};

// 중요: 브라우저는 페이지 로드 직후에 목소리 목록을 바로 불러오지 못할 때가 많습니다.
// 아래 이벤트를 등록해두면 목소리가 준비되는 순간 리스트를 갱신합니다.
useEffect(() => {
  const setVoiceList = () => {
    window.speechSynthesis.getVoices();
  };
  window.speechSynthesis.onvoiceschanged = setVoiceList;
  setVoiceList();
}, []);

// 브라우저가 목소리 목록을 로드하는 데 시간이 걸릴 수 있으므로 초기 로드 처리
useEffect(() => {
  window.speechSynthesis.getVoices();
}, []);

// ... 하단 생략

  const handleSubmit = async () => {
    const isOutOfTries = usageCount >= MAX_LIMIT;
    const currentToken = formData.userToken || activeToken; 

    if (!currentToken) {
      return alert("Please enter an Access Token to start or recharge! 🐯");
    }
    if (!formData.fullName) return alert("Please enter your name! ✨");

    setLoading(true);
    setResults([]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userToken: currentToken })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Access Denied");
      }

      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        setResults(JSON.parse(jsonMatch[0]));

        let nextCount;
        if (formData.userToken !== '') {
          setActiveToken(formData.userToken);
          localStorage.setItem('kname_active_token', formData.userToken);
          nextCount = 1; 
          setFormData(prev => ({ ...prev, userToken: '' })); 
        } else {
          nextCount = usageCount + 1;
        }

        if (nextCount >= MAX_LIMIT) {
          setActiveToken(null);
          localStorage.removeItem('kname_active_token');
        }

        setUsageCount(nextCount);
        localStorage.setItem('kname_usage_count', nextCount.toString());
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFDF0] text-[#333] pb-20 font-sans text-center">
      {/* 1. 인스타그램 배너 */}
      <div className="bg-[#FF913D] py-5 px-6 border-b-[4px] border-black sticky top-0 z-50 shadow-md">
        <a href="https://instagram.com/horeng_kr" target="_blank" className="group inline-flex items-center justify-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          <span className="text-white font-black text-lg sm:text-xl tracking-tight uppercase">
            Follow Instagram <span className="text-black italic underline decoration-white decoration-2 underline-offset-4">@horeng_kr</span> for your K-name Keyring & more info
          </span>
        </a>
      </div>

      <header className="py-12">
        <div className="animate-bounce leading-none drop-shadow-lg inline-block" style={{ fontSize: '60px' }}>🐯</div>
        <h1 className="text-5xl font-black text-black tracking-tighter italic uppercase mt-4">MY OWN K-NAME</h1>
        <p className="text-gray-400 font-bold text-sm uppercase tracking-[0.2em] mt-3 italic">Discover your destiny in 3 Korean syllables</p>
      </header>

      <div className="max-w-md mx-auto px-6 space-y-10">
        <section className="bg-white border-[4px] border-black p-8 rounded-[3rem] shadow-[12px_12px_0px_0px_#FFD95A]">
          <div className="space-y-6">
            {/* 토큰 입력칸 */}
            <div className="bg-[#FFFCEB] p-4 rounded-2xl border-2 border-black border-dashed text-left">
              <div className="flex justify-between items-center mb-1">
                <label className="block font-black text-[10px] text-black uppercase tracking-widest">Access Token</label>
                <span className="text-[10px] font-bold text-[#FF913D]">
                  {usageCount >= MAX_LIMIT ? "RECHARGE REQUIRED 🐯" : `${MAX_LIMIT - usageCount} tries left`}
                </span>
              </div>
              <input 
                name="userToken" type="password" value={formData.userToken} onChange={handleChange} 
                className="w-full bg-white p-2 rounded-lg font-bold outline-none border-2 border-black focus:border-[#FF913D]" 
                placeholder={usageCount >= MAX_LIMIT ? "Enter token to recharge 3 tries" : "Optional (Token saved)"} 
              />
            </div>

            {/* 이름 입력칸 */}
            <div className="border-b-4 border-dashed border-[#FF913D]/30 pb-2 text-left">
              <label className="block font-black text-xs text-[#FF913D] mb-1 uppercase tracking-widest">Full Name</label>
              <input name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-transparent outline-none text-2xl font-black" placeholder="Your Name" />
            </div>

            {/* 성별 & 국적 (복구됨) */}
            <div className="grid grid-cols-2 gap-6 text-left">
              <div>
                <label className="block font-black text-[10px] text-gray-400 mb-1 uppercase tracking-widest">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-[#F5F5F5] p-3 rounded-2xl font-bold border-2 border-transparent focus:border-[#FF913D] outline-none">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Choose not to specify">Choose not to specify</option>
                </select>
              </div>
              <div>
                <label className="block font-black text-[10px] text-gray-400 mb-1 uppercase tracking-widest">Nationality</label>
                <input name="nationality" value={formData.nationality} onChange={handleChange} className="w-full bg-[#F5F5F5] p-3 rounded-2xl font-bold border-2 border-transparent focus:border-[#FF913D] outline-none" placeholder="USA" />
              </div>
            </div>

            {/* 스타일 선택 (복구됨) */}
            <div className="text-left">
              <label className="block font-black text-[10px] text-gray-400 mb-1 uppercase tracking-widest">Preferred Style</label>
              <select name="style" value={formData.style} onChange={handleChange} className="w-full bg-[#F5F5F5] p-3 rounded-2xl font-bold border-2 border-transparent focus:border-[#FF913D] outline-none">
                <option value="Trendy">Trendy & Modern</option>
                <option value="Classic">Classic & Traditional</option>
                <option value="Strong">Strong & Bold</option>
                <option value="Soft">Soft & Pure</option>
              </select>
            </div>

            <button onClick={handleSubmit} disabled={loading} className="w-full py-5 rounded-[2.5rem] font-black text-xl border-2 border-black shadow-lg bg-black text-[#FF913D] uppercase active:translate-y-1 hover:bg-[#FF913D] hover:text-white transition-all">
              {loading ? "Creating Magic... ✨" : "Get My K-Names! ✨"}
            </button>
          </div>
        </section>

        {/* 결과창 */}
        {results.length > 0 && (
          <div className="space-y-6 pb-20 animate-in fade-in zoom-in duration-500 text-left">
            {results.map((res, i) => (
              <div key={i} className="bg-white border-[3px] border-black p-7 rounded-[2.5rem] relative shadow-[8px_8px_0px_0px_#000]">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex-1">
                    <h3 className="text-5xl font-black text-black tracking-tighter leading-tight block">{res.kName}</h3>
                    <p className="text-[#FF913D] font-black tracking-widest text-sm uppercase mt-1">{res.roman}</p>
                  </div>
                  <button onClick={() => speak(res.kName)} className="w-16 h-16 bg-[#FFF0E5] text-3xl rounded-2xl border-2 border-black hover:bg-[#FF913D] hover:text-white flex items-center justify-center shrink-0 ml-4 transition-colors">🔊</button>
                </div>
                <div className="space-y-4 border-t-2 border-dotted border-gray-100 pt-5">
                  <div className="flex items-start gap-2">
                    <span className="bg-black text-white text-[10px] px-2 py-1 rounded-full font-black uppercase whitespace-nowrap mt-0.5">Meaning</span>
                    <p className="text-sm font-bold text-gray-700 leading-snug">{res.meaning}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-[#FF913D] text-white text-[10px] px-2 py-1 rounded-full font-black uppercase italic whitespace-nowrap mt-0.5">Analysis</span>
                    <p className="text-[11px] font-bold text-gray-500 leading-relaxed italic">"{res.why}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}