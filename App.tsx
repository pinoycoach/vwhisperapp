import React, { useState, useRef } from 'react';
import { Sparkles, Play, Pause, Volume2, Stars, BookOpen, Download, ShieldCheck, RefreshCw, Heart, Anchor, Compass } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'input' | 'generating' | 'reveal'>('input');
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<'spirit' | 'lover' | 'mentor'>('spirit');
  const [includeVerse, setIncludeVerse] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSummon = async () => {
    if (!input.trim()) return;
    setView('generating');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, mode, includeScripture: includeVerse })
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.content);
        setView('reveal');
      }
    } catch (e) {
      alert("The Sanctuary is quiet right now. Try again in a moment.");
      setView('input');
    }
  };

  const togglePlay = () => {
    // In PROD, this plays the generated AI voice
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans selection:bg-amber-500/30">
      
      {/* Dynamic Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black pointer-events-none" />

      <div className="z-10 w-full max-w-md">
        
        {/* LOGO */}
        <div className="flex items-center justify-center gap-3 opacity-30 mb-12">
          <Stars size={12} />
          <h1 className="font-serif text-[10px] tracking-[0.6em] font-bold uppercase">Vitruviano</h1>
        </div>

        {/* --- VIEW: INPUT --- */}
        {view === 'input' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h2 className="text-4xl font-light text-center leading-tight">What does your <span className="italic text-zinc-400">soul</span> need?</h2>
            
            {/* PIVOT MODES */}
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setMode('spirit')} className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${mode === 'spirit' ? 'bg-white/10 border-white/20' : 'border-transparent opacity-40'}`}>
                <Anchor size={20} className="mb-2" />
                <span className="text-[8px] uppercase tracking-widest font-black">Spirit</span>
              </button>
              <button onClick={() => setMode('lover')} className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${mode === 'lover' ? 'bg-white/10 border-white/20' : 'border-transparent opacity-40'}`}>
                <Heart size={20} className="mb-2" />
                <span className="text-[8px] uppercase tracking-widest font-black">Heart</span>
              </button>
              <button onClick={() => setMode('mentor')} className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${mode === 'mentor' ? 'bg-white/10 border-white/20' : 'border-transparent opacity-40'}`}>
                <Compass size={20} className="mb-2" />
                <span className="text-[8px] uppercase tracking-widest font-black">Mind</span>
              </button>
            </div>

            <div className="space-y-10">
              <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="I feel overwhelmed..." className="w-full bg-transparent text-2xl font-light text-center border-b border-white/5 py-4 outline-none resize-none h-32" />
              
              <div className="flex flex-col items-center gap-6">
                <button onClick={() => setIncludeVerse(!includeVerse)} className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all ${includeVerse ? 'bg-amber-900/20 border-amber-500/40 text-amber-100' : 'border-white/5 text-white/20'}`}>
                  <BookOpen size={12} />
                  <span className="text-[9px] uppercase tracking-[0.3em] font-bold">Still Small Voice</span>
                </button>
                <button onClick={handleSummon} className="w-full bg-white text-black font-bold py-6 rounded-full flex items-center justify-center gap-3">
                  <Sparkles size={16} />
                  <span className="uppercase tracking-[0.4em] text-[9px]">Summon Presence</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: GENERATING --- */}
        {view === 'generating' && (
          <div className="flex flex-col items-center justify-center space-y-6 animate-pulse">
            <div className="w-12 h-12 border-t-2 border-white/40 rounded-full animate-spin"></div>
            <p className="text-[9px] uppercase tracking-[0.5em] font-light text-white/30">Consulting the stars...</p>
          </div>
        )}

        {/* --- VIEW: REVEAL --- */}
        {view === 'reveal' && result && (
          <div className="space-y-8 animate-in fade-in duration-1000">
            <div className="relative aspect-[3/4] w-full rounded-[3rem] overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773" className="w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0 p-10 flex flex-col justify-between text-center">
                <div className="flex justify-center">
                   <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-2">
                      <ShieldCheck size={10} className="text-emerald-500" />
                      <span className="text-[7px] uppercase tracking-[0.25em] font-black text-white/70">Verified Synthesis</span>
                   </div>
                </div>
                <div className="space-y-6">
                  <p className="italic text-2xl text-white/95">"{result.message}"</p>
                  <p className="text-[10px] uppercase tracking-widest text-amber-200/50">{result.quote}</p>
                </div>
                <button onClick={togglePlay} className="w-20 h-20 bg-white text-black rounded-full mx-auto flex items-center justify-center hover:scale-105 transition-all">
                  {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                </button>
              </div>
            </div>
            
            <div className="flex gap-3 w-full">
              <button onClick={() => setView('input')} className="flex-1 py-4 border border-white/5 rounded-full text-[9px] uppercase tracking-[0.3em] font-bold text-white/20">Reset</button>
              <button className="flex-[2] bg-white text-black rounded-full text-[9px] uppercase tracking-[0.3em] font-black flex items-center justify-center gap-2">
                <Download size={14} /> Unlock Voice ($2.99)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;