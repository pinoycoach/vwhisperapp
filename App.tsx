import React, { useState, useRef } from 'react';
import { Sparkles, Play, Pause, Volume2, Stars, BookOpen, Download, ShieldCheck, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'input' | 'generating' | 'preview' | 'reveal'>('input');
  const [input, setInput] = useState("");
  const [selectedMode, setSelectedMode] = useState('encouragement');
  const [includeVerse, setIncludeVerse] = useState(false);
  const [gift, setGift] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
      else { audioRef.current.play(); setIsPlaying(true); }
    }
  };

  const handleDraft = async () => {
    if (!input.trim()) return;
    setView('generating');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'draft', input, mode: selectedMode, includeVerse })
      });
      
      if (!response.ok) throw new Error("Offline");

      const data = await response.json();
      setGift(data.content);
      setView('preview');
    } catch (e) {
      // --- DEMO MODE FALLBACK ---
      // This allows you to see the UI even if the backend isn't running locally
      console.log("Running in Demo Mode...");
      setTimeout(() => {
        setGift({
          message: "You are not a coincidence; you are a craftsmanship. Your path is being paved with intention, even in the silence.",
          quote: "For I know the plans I have for you, declares the Lord. — Jeremiah 29:11"
        });
        setView('preview');
      }, 2000);
    }
  };

  const handleFinalize = () => setView('reveal');

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center overflow-hidden relative p-6">
      
      {/* Dynamic Aura */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-1/4 -left-1/4 w-[70%] h-[70%] rounded-full blur-[120px] transition-all duration-[2000ms] opacity-20 ${includeVerse ? 'bg-amber-600' : 'bg-indigo-900'}`}></div>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col h-[90vh] justify-between py-10">
        <div className="flex items-center justify-center gap-3 opacity-30">
          <Stars size={12} />
          <h1 className="font-serif text-[10px] tracking-[0.6em] font-bold uppercase">Vitruviano</h1>
        </div>

        {view === 'input' && (
          <div className="flex-1 flex flex-col justify-center space-y-12">
            <h2 className="text-4xl font-light tracking-tight text-center leading-tight">
              What do you need to <span className="italic text-zinc-400">hear</span>?
            </h2>
            
            <div className="space-y-10">
              <textarea 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Share your heart..." 
                className="w-full bg-transparent text-2xl font-light text-center border-b border-white/10 py-4 outline-none resize-none h-32 placeholder:text-white/5" 
              />
              <div className="flex flex-col items-center gap-6">
                <button 
                  onClick={() => setIncludeVerse(!includeVerse)} 
                  className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-700 ${includeVerse ? 'bg-amber-900/20 border-amber-500/40 text-amber-100' : 'border-white/5 text-white/20'}`}
                >
                  <BookOpen size={12} />
                  <span className="text-[9px] uppercase tracking-[0.3em] font-bold">Still Small Voice</span>
                </button>
                <button 
                  onClick={handleDraft} 
                  disabled={!input.trim()} 
                  className="w-full bg-white text-black font-bold py-6 rounded-full flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
                >
                  <Sparkles size={16} />
                  <span className="uppercase tracking-[0.4em] text-[9px]">Begin Alchemy</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'generating' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="w-12 h-12 border-t-2 border-white/40 rounded-full animate-spin"></div>
            <p className="text-[9px] uppercase tracking-[0.5em] font-light text-white/30">Consulting the stars...</p>
          </div>
        )}

        {view === 'preview' && gift && (
          <div className="flex-1 flex flex-col items-center space-y-8">
            <div className="w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/5 relative shadow-2xl bg-[#0a0a0a]">
              <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773" className="w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0 p-10 flex items-center justify-center text-center">
                <p className="italic text-2xl leading-relaxed text-white/90">"{gift.message}"</p>
              </div>
            </div>
            <button 
              onClick={handleFinalize} 
              className="w-full bg-zinc-900 border border-white/10 py-6 rounded-full uppercase tracking-[0.4em] text-[9px] font-bold flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all"
            >
              <Volume2 size={16} /> Reveal Voice
            </button>
          </div>
        )}

        {view === 'reveal' && gift && (
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full aspect-[9/16] max-h-[550px] rounded-[3rem] overflow-hidden border border-white/5 relative bg-black shadow-2xl">
              <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-black/40 p-10 flex flex-col justify-between text-center">
                <div className="flex justify-center">
                   <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-2">
                      <ShieldCheck size={10} className="text-emerald-500" />
                      <span className="text-[7px] uppercase tracking-[0.25em] font-black text-white/70">Verified Synthesis</span>
                   </div>
                </div>
                <div className="space-y-6">
                  <p className="italic text-2xl text-white/95">"{gift.message}"</p>
                  <p className="text-[10px] uppercase tracking-widest text-amber-200/50 px-4">{gift.quote}</p>
                </div>
                <button 
                  onClick={togglePlay} 
                  className="w-20 h-20 bg-white text-black rounded-full mx-auto flex items-center justify-center hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-8 w-full">
              <button onClick={() => setView('input')} className="flex-1 py-4 border border-white/5 rounded-full text-[9px] uppercase tracking-[0.3em] font-bold text-white/20">Reset</button>
              <button className="flex-[2] bg-white text-black rounded-full text-[9px] uppercase tracking-[0.3em] font-black flex items-center justify-center gap-2">
                <Download size={14} /> Keep Forever ($2.99)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;