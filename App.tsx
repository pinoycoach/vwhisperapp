
import React, { useState, useRef, useEffect } from 'react';
import { generateWhisperContent, generateWhisperImage, generateWhisperAudio } from './services/geminiService';
import { WhisperGift } from './types';
import { LOADING_MESSAGES, GIFT_MODES, GiftMode } from './constants';
import { 
  Sparkles, Play, Pause, Volume2, Stars, BookOpen, Download, ShieldCheck
} from 'lucide-react';

const SAMPLE_RATE = 24000; 

const decodeAudioData = (base64: string): Float32Array => {
  const binaryString = atob(base64);
  const dataInt16 = new Int16Array(new Uint8Array(Array.from(binaryString, c => c.charCodeAt(0))).buffer);
  const float32 = new Float32Array(dataInt16.length);
  for (let i = 0; i < dataInt16.length; i++) float32[i] = dataInt16[i] / 32768.0;
  return float32;
};

const createWavUrl = (base64: string): string => {
  const binaryString = atob(base64);
  const buffer = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) buffer[i] = binaryString.charCodeAt(i);
  const wavHeader = new Uint8Array(44);
  const view = new DataView(wavHeader.buffer);
  const writeS = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  writeS(0, 'RIFF');
  view.setUint32(4, 36 + buffer.length, true);
  writeS(8, 'WAVE');
  writeS(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeS(36, 'data');
  view.setUint32(40, buffer.length, true);
  return URL.createObjectURL(new Blob([wavHeader, buffer], { type: 'audio/wav' }));
};

const App: React.FC = () => {
  const [view, setView] = useState<'input' | 'generating' | 'preview' | 'reveal'>('input');
  const [input, setInput] = useState("");
  const [selectedMode, setSelectedMode] = useState<GiftMode>('encouragement');
  const [includeVerse, setIncludeVerse] = useState(false);
  const [gift, setGift] = useState<WhisperGift | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);

  useEffect(() => {
    const initAudio = () => { if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: SAMPLE_RATE }); };
    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  useEffect(() => {
    if (gift?.audioBase64 && audioCtxRef.current) {
      const pcmData = decodeAudioData(gift.audioBase64);
      const buffer = audioCtxRef.current.createBuffer(1, pcmData.length, SAMPLE_RATE);
      buffer.getChannelData(0).set(pcmData);
      audioBufferRef.current = buffer;
      pausedAtRef.current = 0;
    }
  }, [gift?.audioBase64]);

  const togglePlay = () => {
    if (isPlaying) {
      sourceRef.current?.stop();
      pausedAtRef.current = audioCtxRef.current!.currentTime - startTimeRef.current;
      setIsPlaying(false);
    } else {
      if (!audioBufferRef.current) return;
      const source = audioCtxRef.current!.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(audioCtxRef.current!.destination);
      const offset = pausedAtRef.current % audioBufferRef.current.duration;
      source.start(0, offset);
      startTimeRef.current = audioCtxRef.current!.currentTime - offset;
      sourceRef.current = source;
      setIsPlaying(true);
      source.onended = () => { if (Math.abs(audioCtxRef.current!.currentTime - startTimeRef.current - audioBufferRef.current!.duration) < 0.2) { setIsPlaying(false); pausedAtRef.current = 0; } };
    }
  };

  const handleDraft = async () => {
    if (!input.trim()) return;
    setView('generating');
    setLoadingMsg("Deep listening...");
    try {
      const content = await generateWhisperContent(input, selectedMode, includeVerse);
      setLoadingMsg("Capturing the essence...");
      const imageUrl = await generateWhisperImage(content.imagePrompt);
      setGift({ id: Date.now().toString(), occasion: input, ...content, imageUrl });
      setView('preview');
    } catch (e) { setView('input'); }
  };

  const handleFinalize = async () => {
    if (!gift) return;
    setView('generating');
    setLoadingMsg("Tuning the frequencies...");
    try {
      const audioBase64 = await generateWhisperAudio(gift.message, selectedMode);
      setGift(prev => prev ? ({ ...prev, audioBase64 }) : null);
      setView('reveal');
    } catch (e) { setView('preview'); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Lato'] flex flex-col items-center justify-center overflow-hidden relative selection:bg-amber-500/30">
      
      {/* Dynamic Aura */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-1/4 -left-1/4 w-[70%] h-[70%] rounded-full blur-[160px] transition-all duration-[2000ms] opacity-20 ${includeVerse ? 'bg-amber-600' : selectedMode === 'encouragement' ? 'bg-blue-900' : selectedMode === 'mantra' ? 'bg-indigo-900' : 'bg-purple-900'}`}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 flex flex-col h-[92vh] justify-between py-10">
        <div className="flex items-center justify-center gap-3 opacity-30">
          <Stars size={12} />
          <h1 className="font-['Cinzel'] text-[9px] tracking-[0.6em] font-bold uppercase">Vitruviano</h1>
        </div>

        {view === 'input' && (
          <div className="flex-1 flex flex-col justify-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h2 className="text-4xl font-light tracking-tight leading-[1.2] text-center">
              What do you need to <span className="romance-font italic text-zinc-400">hear</span>?
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
                  className={`group flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-1000 ${includeVerse ? 'bg-amber-900/20 border-amber-500/40 text-amber-100 shadow-[0_0_50px_rgba(245,158,11,0.1)] scale-105' : 'bg-white/5 border-white/5 text-white/20 hover:text-white/40'}`}
                >
                  <BookOpen size={12} className={includeVerse ? "animate-pulse" : ""} />
                  <span className="text-[9px] uppercase tracking-[0.3em] font-bold">Still Small Voice</span>
                  {includeVerse && <div className="w-1 h-1 bg-amber-400 rounded-full animate-ping"></div>}
                </button>

                <button
                  onClick={handleDraft}
                  disabled={!input.trim()}
                  className="w-full group bg-white text-black font-bold py-6 rounded-full transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3"
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
            <div className="relative w-12 h-12 flex items-center justify-center">
               <div className="absolute inset-0 border-t border-white/40 rounded-full animate-spin"></div>
               <Stars className="text-white/10 animate-pulse" size={20} />
            </div>
            <p className="text-[9px] uppercase tracking-[0.5em] font-light text-white/30">{loadingMsg}</p>
          </div>
        )}

        {view === 'preview' && gift && (
          <div className="flex-1 flex flex-col items-center animate-in fade-in duration-1000 space-y-8">
            <div className="w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/5 relative shadow-2xl bg-[#0a0a0a]">
              <img src={gift.imageUrl} className="w-full h-full object-cover opacity-50" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent p-10 flex items-end">
                <p className="romance-font italic text-2xl leading-relaxed text-white/80">"{gift.message}"</p>
              </div>
            </div>
            <button 
              onClick={handleFinalize}
              className="w-full bg-zinc-900/50 border border-white/5 py-6 rounded-full uppercase tracking-[0.4em] text-[9px] font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-3"
            >
              <Volume2 size={16} /> Reveal Voice
            </button>
          </div>
        )}

        {view === 'reveal' && gift && (
          <div className="flex-1 flex flex-col items-center animate-in fade-in duration-1000">
            <div className="w-full aspect-[9/16] max-h-[600px] rounded-[3rem] overflow-hidden border border-white/5 relative bg-black shadow-2xl group">
              <img src={gift.imageUrl} className={`w-full h-full object-cover transition-transform duration-[60s] ease-linear ${isPlaying ? 'scale-110' : 'scale-100'}`} alt="" />
              
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 p-10 flex flex-col">
                
                {/* Header Metadata */}
                <div className="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-1000">
                   <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                      <ShieldCheck size={10} className="text-emerald-500" />
                      <span className="text-[7px] uppercase tracking-[0.25em] font-black text-white/70">Verified Synthesis</span>
                   </div>
                </div>

                {/* Main Message (Middle) */}
                <div className="flex-1 flex items-center justify-center text-center">
                  <p className="romance-font italic text-2xl md:text-3xl leading-[1.6] text-white/95 drop-shadow-2xl">
                    "{gift.message}"
                  </p>
                </div>

                {/* Quote / Scripture (Above Button) */}
                <div className="flex flex-col items-center text-center space-y-8 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                  <div className="max-w-[85%]">
                    <div className="w-8 h-px bg-white/10 mx-auto mb-6"></div>
                    <p className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-white/60 italic leading-relaxed font-light drop-shadow-lg">
                      {gift.quote}
                    </p>
                  </div>

                  {/* Play Button - The Anchor */}
                  <button 
                    onClick={togglePlay}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${isPlaying ? 'bg-white/10 backdrop-blur-2xl border border-white/10 scale-95' : 'bg-white text-black hover:scale-105 active:scale-90'}`}
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                  </button>
                </div>

                {/* Footer / Brand (Minimal) */}
                <div className="flex justify-center items-center py-4 border-t border-white/5 opacity-20">
                    <p className="text-[6px] uppercase tracking-[0.5em] font-['Cinzel'] font-bold">Vitruviano</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8 w-full">
              <button onClick={() => setView('input')} className="flex-1 py-4 border border-white/5 rounded-full text-[9px] uppercase tracking-[0.3em] font-bold text-white/20 hover:text-white hover:border-white/10 transition-all">Reset</button>
              <button onClick={() => { if (gift.audioBase64) { const url = createWavUrl(gift.audioBase64); const a = document.createElement('a'); a.href = url; a.download = 'whisper.wav'; a.click(); } }} className="flex-[2] py-4 bg-white text-black rounded-full text-[9px] uppercase tracking-[0.3em] font-black flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all shadow-xl active:scale-95"><Download size={14} /> Export Whisper</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
