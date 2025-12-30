"use client";

import { useState, useEffect } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    fullName: '', 
    gender: 'Male', 
    style: 'Trendy', 
    userToken: ''
  });
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0); 
  const MAX_LIMIT = 3;
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

  const speak = (text: string) => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      
      const voices = window.speechSynthesis.getVoices();
      
      // 환경별 최적의 목소리를 찾기 위한 우선순위 필터링
      const preferredVoice = 
        // 1순위: 구글의 자연스러운 한국어 (안드로이드, 크롬)
        voices.find(v => v.lang === 'ko-KR' && v.name.includes('Google')) ||
        // 2순위: 애플의 자연스러운 한국어 (Siri, Yuna - 아이폰, 맥)
        voices.find(v => v.lang === 'ko-KR' && (v.name.includes('Siri') || v.name.includes('Premium'))) ||
        // 3순위: 마이크로소프트의 자연스러운 한국어 (SunHi, InJoon - 윈도우 엣지)
        voices.find(v => v.lang === 'ko-KR' && v.name.includes('Natural')) ||
        // 4순위: 기타 시스템 기본 한국어
        voices.find(v => v.lang === 'ko-KR');
  
      if (preferredVoice) utterance.voice = preferredVoice;
      
      // 속도가 너무 빠르면 기계음처럼 들리므로, 0.85 ~ 0.95 사이가 가장 '사람' 같습니다.
      utterance.rate = 0.92; 
      utterance.pitch = 1.0;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard! 🐯");
  };

  const handleSubmit = async () => {
    const currentToken = formData.userToken || activeToken; 
    if (!currentToken) return alert("Please enter an Access Token! 🐯");
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
      if (!response.ok) throw new Error(data.error || "Access Denied");

      setResults(data);

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

    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFDF0] text-[#333] pb-20 font-sans text-center">
      {/* 1. 인스타그램 배너 (높이만 줄이고 문구 전체 복구 + 마크 앞으로) */}
      <div className="bg-[#FF913D] py-3 px-6 border-b-[3px] border-black sticky top-0 z-50 shadow-md">
        <a href="https://instagram.com/horeng_kr" target="_blank" className="group inline-flex items-center justify-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          <span className="text-white font-black text-[11px] sm:text-[13px] tracking-tight uppercase">
            Follow Instagram <span className="text-black italic underline decoration-white decoration-2 underline-offset-4">@horeng_kr</span> for your K-name Keyring & more info
          </span>
        </a>
      </div>

      <header className="py-10">
        {/* 호랑이 애니메이션 바운스로 복구 */}
        <div className="animate-bounce leading-none drop-shadow-lg inline-block" style={{ fontSize: '60px' }}>🐯</div>
        <h1 className="text-5xl font-black text-black tracking-tighter italic uppercase mt-4">MY OWN K-NAME</h1>
        <p className="text-gray-400 font-bold text-sm uppercase tracking-[0.2em] mt-3 italic">Discover your destiny in 3 Korean syllables</p>
      </header>

      <div className="max-w-md mx-auto px-6 space-y-10">
        <section className="bg-white border-[4px] border-black p-8 rounded-[3rem] shadow-[12px_12px_0px_0px_#FFD95A]">
          <div className="space-y-6">
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
                placeholder={usageCount >= MAX_LIMIT ? "Enter token to recharge" : "Optional (Saved)"} 
              />
            </div>

            <div className="border-b-4 border-dashed border-[#FF913D]/30 pb-2 text-left">
              <label className="block font-black text-xs text-[#FF913D] mb-1 uppercase tracking-widest">Full Name</label>
              <input name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-transparent outline-none text-2xl font-black" placeholder="Your Name" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <label className="block font-black text-[10px] text-gray-400 mb-1 uppercase tracking-widest">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-[#F5F5F5] p-3 rounded-2xl font-bold border-2 border-transparent focus:border-[#FF913D] outline-none">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Neutral">Neutral</option>
                </select>
              </div>
              <div>
                <label className="block font-black text-[10px] text-gray-400 mb-1 uppercase tracking-widest">Style</label>
                <select name="style" value={formData.style} onChange={handleChange} className="w-full bg-[#F5F5F5] p-3 rounded-2xl font-bold border-2 border-transparent focus:border-[#FF913D] outline-none">
                  <option value="Trendy">Trendy</option>
                  <option value="Classic">Classic</option>
                  <option value="Strong">Strong</option>
                  <option value="Soft">Soft</option>
                </select>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading} className="w-full py-5 rounded-[2.5rem] font-black text-xl border-2 border-black shadow-lg bg-black text-[#FF913D] uppercase active:translate-y-1 hover:bg-[#FF913D] hover:text-white transition-all">
              {loading ? "Creating Magic... ✨" : "Get My K-Names! ✨"}
            </button>
          </div>
        </section>

        {results.length > 0 && (
          <div className="space-y-6 pb-20 animate-in fade-in zoom-in duration-500 text-left">
            <p className="text-center font-black text-[#FF913D] animate-pulse uppercase tracking-tighter">
              📸 Don't forget to capture and share your names!
            </p>
            
            {results.map((res, i) => (
              <div key={i} className="bg-white border-[3px] border-black p-7 rounded-[2.5rem] relative shadow-[8px_8px_0px_0px_#000]">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex-1">
                    <h3 className="text-5xl font-black text-black tracking-tighter leading-tight block">{res.kName}</h3>
                    <p className="text-[#FF913D] font-black tracking-widest text-sm uppercase mt-1">{res.roman}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copyToClipboard(res.kName)} className="w-12 h-12 bg-[#F0F0F0] text-xl rounded-xl border-2 border-black hover:bg-black hover:text-white flex items-center justify-center transition-colors">📋</button>
                    <button onClick={() => speak(res.kName)} className="w-12 h-12 bg-[#FFF0E5] text-xl rounded-xl border-2 border-black hover:bg-[#FF913D] hover:text-white flex items-center justify-center transition-colors">🔊</button>
                  </div>
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