"use client";

import { useState } from "react";

export default function Home() {
  const [originalName, setOriginalName] = useState("");
  const [token, setToken] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 고품질 TTS 로직
  const speak = (text: string) => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      
      // 기기별 최적의 목소리 찾기
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = 
        voices.find(v => v.lang === 'ko-KR' && (v.name.includes('Google') || v.name.includes('Apple'))) ||
        voices.find(v => v.lang === 'ko-KR');

      if (preferredVoice) utterance.voice = preferredVoice;
      
      utterance.rate = 0.9; // 듣기 편한 속도로 소폭 조정
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const generateNames = async () => {
    if (!originalName || !token) {
      alert("Please enter both name and token.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalName, token }),
      });

      const data = await response.json();
      if (response.ok) {
        setResults(data.results);
      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch (error) {
      alert("Error generating names.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* 1. 슬림해진 상단 오렌지 바 */}
      <div className="bg-[#FF4500] text-white py-2 px-4 text-center text-[13px] font-medium flex items-center justify-center gap-2">
        <span>📸</span> 
        <span>Follow <b>@horeng_kr</b> on Instagram for more!</span>
      </div>

      <div className="max-w-md mx-auto px-6 py-10">
        {/* 헤더 섹션 */}
        <div className="flex flex-col items-center mb-10">
          <img src="/horeng-logo.png" alt="Tiger Logo" className="w-[60px] h-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Horeng Name</h1>
          <p className="text-gray-500 text-center text-sm leading-relaxed">
            Find your perfect Korean name<br/>
            based on your original name's sound.
          </p>
        </div>

        {/* 입력 섹션 */}
        <div className="space-y-4 mb-10">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 ml-1">Original Name</label>
            <input
              type="text"
              placeholder="e.g. Alexander"
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#FF4500] transition-all text-lg"
              value={originalName}
              onChange={(e) => setOriginalName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 ml-1">Access Token</label>
            <input
              type="text"
              placeholder="Enter your token"
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#FF4500] transition-all text-lg"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
          <button
            onClick={generateNames}
            disabled={loading}
            className="w-full bg-black text-white py-5 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all active:scale-[0.98] disabled:bg-gray-300"
          >
            {loading ? "Creating your names..." : "Get Korean Names 🐯"}
          </button>
        </div>

        {/* 결과 섹션 */}
        {results.length > 0 && (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Your Korean Names</h2>
            <div className="space-y-5">
              {results.map((res, idx) => (
                <div key={idx} className="bg-gray-50 p-6 rounded-[24px] border border-gray-100 flex flex-col items-center">
                  <span className="text-4xl font-bold text-gray-900 mb-2">{res.koreanName}</span>
                  <span className="text-gray-500 font-medium mb-4">{res.romanization}</span>
                  <p className="text-gray-600 text-center text-sm mb-6 leading-relaxed">
                    {res.meaning}
                  </p>
                  <button
                    onClick={() => speak(res.koreanName)}
                    className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    <span className="text-lg">🔊</span>
                    <span className="text-sm font-semibold text-gray-700">Listen</span>
                  </button>
                </div>
              ))}
            </div>
            
            {/* 📸 캡쳐 안내 문구 추가 */}
            <p className="mt-10 text-center text-gray-400 text-[13px] flex items-center justify-center gap-2">
              <span>📸</span> Don't forget to capture and share your names!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}