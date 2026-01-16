import React, { useState, useRef, useEffect } from 'react';
import { generateWhisperContent, generateWhisperImage, generateWhisperAudio } from './services/geminiService';
import { WhisperGift } from './types';
import { LOADING_MESSAGES, GIFT_MODES, GiftMode } from './constants';
import { 
  Sparkles, Play, Pause, Volume2, Stars, BookOpen, Download, ShieldCheck, RefreshCw
} from 'lucide-react';

const SAMPLE_RATE = 24000; 

const App: React.FC = () => {
  const [view, setView] = useState<'input' | 'generating' | 'preview' | 'reveal'>('input');
  const [input, setInput] = useState("");
  const [selectedMode, setSelectedMode] = useState<GiftMode>('encouragement');
  const [includeVerse, setIncludeVerse] = useState(false);
  const [gift, setGift] = useState<any>(null); // Changed to handle Supabase data
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- NEW PRODUCTION AUDIO PLAYER ---
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // --- THE BUSINESS LOGIC (TALKS TO YOUR VAULT) ---
  const handleDraft = async () => {
    if (!input.trim()) return;
    setView('generating');
    setLoadingMsg("Consulting the Vault...");
    
    try {
      // This now calls your Vercel API via the service
      const content = await generateWhisperContent(input, selectedMode, includeVerse);
      
      if (content) {
        setGift(content);
        setView('preview');
      } else {
        throw new Error("Vault timeout");
      }
    } catch (e) {
      alert("The Sanctuary is busy. Please try again.");
      setView('input');
    }
  };

  const handleFinalize = async () => {
    setView('generating');
    setLoadingMsg("Tuning the frequencies...");
    
    try {
      // In PROD, this is where Stripe would trigger
      const audioBase64 = await generateWhisperAudio(gift.message, selectedMode);
      setGift((prev: any) => ({ ...prev, audioBase64 }));
      
      // Setup audio for playback
      const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
      audio.onended = () => setIsPlaying(false);
      audioRef.current = audio;
      
      setView('reveal');
    } catch (e) {
      setView('preview');
    }
  };

  const handleReset = () => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    setView('input');
    setInput('');
    setGift(null);
  };

  // --- KEEPING YOUR BEAUTIFUL UI BELOW ---
  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Lato'] flex flex-col items-center justify-center overflow-hidden relative selection:bg-amber-500/30">
      
      {/* Dynamic Aura */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-1/4 -left-1/4 w-[70%] h-[70%] rounded-full blur-[160px] transition-all duration-[2000ms] opacity-20 ${includeVerse ? 'bg-amber-600' : 'bg-indigo-900'}`}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 flex flex-col h-[92vh] justify-between py-10">
        <div className="flex items-center justify-center gap-3 opacity-30">
          <Stars size={12} />
          <h1 className="font-['Cinzel'] text-[9px] tracking-[0.6em] font-bold uppercase">Vitruviano</h1>
        </div>

        {view === 'input' && (
          <div className="flex-1 flex flex-col justify-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h2 className="text-4xl font-light tracking-tight leading-[1.2] text-center">
              What do you need to <span className="italic text-zinc-400">hear</span>?
            </h2>

            <div className="grid grid-cols-3 gap-2">
              {GIFT_MODES.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`flex flex-col items-center p-4 rounded-[2rem] border transition-all duration-700 ${selectedMode === mode.id ? 'bg-white/5 border-white/20' : 'bg-transparent border-transparent opacity-40 hover:opacity-70'}`}
                >
                  <span className="text-2xl mb-1">{mode.icon}</span>
                  <span className="text-[8px] uppercase tracking-widest font-black">{mode.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-10">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Share your heart..."
                className="w-full bg-transparent text-2xl font-light text-center border-b border-white/5 py-4 focus:border-white/20 outline-none placeholder:text-white/5 transition-all"
              />

              <div className="flex flex-col items-center gap-6">
                <button 
                  onClick={() => setIncludeVerse(!includeVerse)}
                  className={`group flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-1000 ${includeVerse ? 'bg-amber-900/20 border-amber-500/40 text-amber-100 shadow-[0_0_50px_rgba(245,158,11,0.1)]' : 'bg-white/5 border-white/5 text-white/20'}`}
                >
                  <BookOpen size={12} />
                  <span className="text-[9px] uppercase tracking-[0.3em] font-bold">Still Small Voice</span>
                </button>

                <button
                  onClick={handleDraft}
                  disabled={!input.trim()}
                  className="w-full bg-white text-black font-bold py-6 rounded-full transition-all flex items-center justify-center gap-3"
                >
                  <Sparkles size={16} />
                  <span className="uppercase tracking-[0.4em] text-[9px]">Begin Alchemy</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'generating' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in fade-in">
            <div className="w-12 h-12 border-t border-white/40 rounded-full animate-spin"></div>
            <p className="text-[9px] uppercase tracking-[0.5em] font-light text-white/30">{loadingMsg}</p>
          </div>
        )}

        {view === 'preview' && gift && (
          <div className="flex-1 flex flex-col items-center animate-in fade-in space-y-8">
            <div className="w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/5 relative shadow-2xl bg-[#0a0a0a]">
              <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773" className="w-full h-full object-cover opacity-50" alt="" />
              <div className="absolute inset-0 p-10 flex items-end">
                <p className="italic text-2xl leading-relaxed text-white/80">"{gift.message}"</p>
              </div>
            </div>
            <button 
              onClick={handleFinalize}
              className="w-full bg-zinc-900/50 border border-white/5 py-6 rounded-full uppercase tracking-[0.4em] text-[9px] font-bold flex items-center justify-center gap-3"
            >
              <Volume2 size={16} /> Reveal Voice
            </button>
          </div>
        )}

        {view === 'reveal' && gift && (
          <div className="flex-1 flex flex-col items-center animate-in fade-in">
            <div className="w-full aspect-[9/16] max-h-[600px] rounded-[3rem] overflow-hidden border border-white/5 relative bg-black shadow-2xl">
              <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773" className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-black/40 p-10 flex flex-col justify-center text-center">
                <p className="italic text-2xl md:text-3xl text-white/95 mb-8">"{gift.message}"</p>
                <button 
                  onClick={togglePlay}
                  className="w-16 h-16 bg-white text-black rounded-full mx-auto flex items-center justify-center"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8 w-full">
              <button onClick={handleReset} className="flex-1 py-4 border border-white/5 rounded-full text-[9px] uppercase tracking-[0.3em] font-bold text-white/20">Reset</button>
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