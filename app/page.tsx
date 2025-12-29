"use client";

import { useState } from "react";

export default function Home() {
  const [originalName, setOriginalName] = useState("");
  const [token, setToken] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const speak = (text: string) => {
    if (typeof window !== 'undefined') {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
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
      {/* 상단 오렌지 바 */}
      <div className="bg-[#FF4500] text-white py-4 px-4 text-center text-sm font-medium">
        Follow <b>@horeng_kr</b> on Instagram for more! 📸
      </div>

      <div className="max-w-md mx-auto px-6 py-12">
        {/* 헤더 섹션 */}
        <div className="flex flex-col items-center mb-10">
          <img src="/horeng-logo.png" alt="Tiger" className="w-[80px] h-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Horeng Name</h1>
          <p className="text-gray-500 text-center">
            Find your perfect Korean name<br/>
            based on your original name's sound.
          </p>
        </div>

        {/* 입력 섹션 */}
        <div className="space-y-4 mb-12">
          <input
            type="text"
            placeholder="Your Name (e.g. Alex)"
            className="w-full px-6 py-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-[#FF4500] transition-all text-lg"
            value={originalName}
            onChange={(e) => setOriginalName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Access Token"
            className="w-full px-6 py-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-[#FF4500] transition-all text-lg"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <button
            onClick={generateNames}
            disabled={loading}
            className="w-full bg-[#FF4500] text-white py-4 rounded-2xl font-bold text-xl hover:bg-[#e63e00] transition-all disabled:bg-gray-300"
          >
            {loading ? "Creating..." : "Get Korean Names"}
          </button>
        </div>

        {/* 결과 섹션 */}
        {results.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Your Korean Names</h2>
            <div className="space-y-6">
              {results.map((res, idx) => (
                <div key={idx} className="bg-gray-50 p-6 rounded-2xl relative border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900">{res.koreanName}</h3>
                      <p className="text-gray-500 font-medium">{res.romanization}</p>
                    </div>
                    <button
                      onClick={() => speak(res.koreanName)}
                      className="bg-white p-3 rounded-full shadow-sm hover:bg-gray-100"
                    >
                      🔊
                    </button>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{res.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}