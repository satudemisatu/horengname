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
      
      const preferredVoice = 
        voices.find(v => v.lang.includes('ko') && (v.name.includes('Yuna') || v.name.includes('Siri'))) ||
        voices.find(v => v.lang.includes('ko') && v.name.includes('Google')) ||
        voices.find(v => v.lang.includes('ko') && v.name.includes('Apple')) ||
        voices.find(v => v.lang.includes('ko'));

      if (preferredVoice) utterance.voice = preferredVoice;
      
      utterance.rate = 0.9; 
      utterance.pitch = 1.05; 
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
      {/* 1. 인스타그램 배너 */}
      <div className="bg-[#FF913D] py-3 px-6 border-b-[3px] border-black sticky top-0 z-50 shadow-md">
        <a href="https://instagram.com/horeng_kr" target="_blank" className="flex items-center justify-center gap-3">
          <svg className="shrink-0" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          
          <div className="text-left">
            <div className="text-white font-black text-sm sm:text-base tracking-tight uppercase leading-none">
              FOLLOW INSTAGRAM <span className="text-black italic underline decoration-white decoration-2 underline-offset-2">@HORENG_KR</span>
            </div>
            <div className="text-white font-bold text-[10px] sm:text-[11px] tracking-tight uppercase mt-1 opacity-90">
              FOR YOUR K-NAME KEYRING & MORE INFO
            </div>
          </div>
        </a>
      </div>

      <header className="py-10">
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
                  <option value="Choose not to specify">Choose not to specify</option>
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
            {/* 문구 크기 복구 및 줄바꿈 적용 */}
            <p className="text-center font-black text-[#FF913D] animate-pulse uppercase tracking-tighter">
              📸 Don't forget to screenshot <br /> and share your Korean Name!
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