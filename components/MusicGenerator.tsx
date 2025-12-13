
import React, { useState } from 'react';
import { generateSongLyrics } from '../services/geminiService';
import { useApp } from '../context/AppContext';
import { X, Music, Loader2, FileText, Check, Mic2, Save, Copy, Sliders, Download } from 'lucide-react';
import { BrandId, ContentItem } from '../types';

interface Props {
  onClose: () => void;
  brandId: BrandId;
}

const MusicGenerator: React.FC<Props> = ({ onClose, brandId }) => {
  const { addContent } = useApp();
  const [step, setStep] = useState<'config' | 'generating' | 'result'>('config');
  
  // Inputs
  const [genre, setGenre] = useState('Gospel');
  const [style, setStyle] = useState('Uplifting Choir');
  const [mood, setMood] = useState('Hopeful');
  const [topic, setTopic] = useState('');
  
  // Output
  const [result, setResult] = useState<{
      title: string;
      lyrics: string;
      styleGuide: string;
      coverPrompt: string;
  } | null>(null);

  const commonGenres = ['Gospel', 'Afrobeat', 'Hip Hop', 'R&B', 'Reggae', 'Acoustic', 'Pop', 'Worship', 'Drill'];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setStep('generating');
    try {
      const data = await generateSongLyrics(genre, style, mood, topic);
      setResult(data);
      setStep('result');
    } catch (error) {
      console.error(error);
      alert("Failed to generate lyrics. Please try again.");
      setStep('config');
    }
  };

  const handleSaveToLibrary = () => {
      if (!result) return;
      
      const thumbUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(result.coverPrompt + " album cover high quality music art")}&width=800&height=800&nologo=true`;
      
      const newItem: ContentItem = {
        id: `gen-lyrics-${Date.now()}`,
        title: result.title,
        description: `Original lyrics for a ${mood} ${genre} song about ${topic}.`,
        thumbnail: thumbUrl,
        brandId: brandId,
        type: 'article', // Storing as article for reading
        isPremium: false,
        date: new Date().toISOString(),
        tags: ['Lyrics', genre, 'Songwriting', 'AI'],
        views: 0,
        interactions: { likes: 0, loves: 0, dislikes: 0, comments: 0 },
        commentList: []
      };

      addContent(newItem);
      alert("Song saved to your library!");
      onClose();
  };

  const copyToClipboard = () => {
      if (result) {
          navigator.clipboard.writeText(`${result.title}\n\n${result.lyrics}`);
          alert("Lyrics copied to clipboard!");
      }
  };

  const handleDownloadCard = async () => {
      if (!result) return;
      
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1350; // Portrait format
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 1350);
      grad.addColorStop(0, '#1e1b4b'); // Dark Indigo
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1350);

      // Header Text
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.font = "bold 60px 'Outfit', sans-serif";
      ctx.fillText(result.title, 540, 150);
      
      ctx.fillStyle = "#818cf8"; // Indigo 400
      ctx.font = "italic 30px 'Outfit', sans-serif";
      ctx.fillText(`${genre} • ${mood}`, 540, 200);

      // Lyrics Content
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "28px 'Courier New', monospace";
      
      const lines = result.lyrics.split('\n');
      let y = 300;
      const lineHeight = 35;
      
      // Basic text wrap and render
      lines.forEach(line => {
          if (y > 1100) return; // Cut off if too long
          ctx.fillText(line, 540, y);
          y += lineHeight;
      });

      // --- WATERMARK LOGIC ---
      const logoSize = 150;
      const x = 50;
      const yLog = 1350 - logoSize - 50;
      const padding = 20;

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 8;

      // Logo Box
      const lGrad = ctx.createLinearGradient(x, yLog, x + logoSize, yLog + logoSize);
      lGrad.addColorStop(0, "#06b6d4");
      lGrad.addColorStop(0.5, "#ec4899");
      lGrad.addColorStop(1, "#f59e0b");
      ctx.lineWidth = 10;
      ctx.strokeStyle = lGrad;
      
      ctx.beginPath();
      const r = 20;
      ctx.moveTo(x + r, yLog);
      ctx.lineTo(x + logoSize - r, yLog);
      ctx.quadraticCurveTo(x + logoSize, yLog, x + logoSize, yLog + r);
      ctx.lineTo(x + logoSize, yLog + logoSize - r);
      ctx.quadraticCurveTo(x + logoSize, yLog + logoSize, x + logoSize - r, yLog + logoSize);
      ctx.lineTo(x + r, yLog + logoSize);
      ctx.quadraticCurveTo(x, yLog + logoSize, x, yLog + logoSize - r);
      ctx.lineTo(x, yLog + r);
      ctx.quadraticCurveTo(x, yLog, x + r, yLog);
      ctx.stroke();

      // Logo S
      const s = (val: number) => (val / 100) * logoSize;
      ctx.lineWidth = 8;
      ctx.strokeStyle = 'white';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x + s(65), yLog + s(35));
      ctx.bezierCurveTo(x + s(35), yLog + s(35), x + s(35), yLog + s(50), x + s(50), yLog + s(50));
      ctx.bezierCurveTo(x + s(65), yLog + s(50), x + s(65), yLog + s(65), x + s(35), yLog + s(65));
      ctx.stroke();

      // Text
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "white";
      ctx.font = "900 50px 'Outfit', sans-serif";
      ctx.fillText("SAMONYA", x + logoSize + padding, yLog + (logoSize * 0.35));
      
      ctx.fillStyle = "#ec4899";
      ctx.font = "700 30px 'Outfit', sans-serif";
      ctx.fillText("DIGITAL UNIVERSE", x + logoSize + padding, yLog + (logoSize * 0.65));
      
      ctx.restore();
      // --- END WATERMARK ---

      const url = canvas.toDataURL("image/jpeg");
      const a = document.createElement('a');
      a.href = url;
      a.download = `Samonya_Lyrics_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl max-w-2xl w-full flex flex-col shadow-[0_0_50px_rgba(99,102,241,0.2)] relative overflow-hidden h-[90vh]">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center shadow-lg border border-indigo-500/30">
               <Music className="text-indigo-400" size={20} />
            </div>
            <div>
               <h2 className="text-xl font-bold text-white leading-tight">AI Lyrics Studio</h2>
               <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Songwriter & Style Architect</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative z-10">
            {step === 'config' && (
                <form onSubmit={handleGenerate} className="space-y-6 max-w-lg mx-auto">
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-3">Song Genre</label>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {commonGenres.map(g => (
                                <button 
                                    key={g}
                                    type="button"
                                    onClick={() => setGenre(g)}
                                    className={`text-xs px-3 py-2 rounded-lg border transition-all ${genre === g ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-800 border-white/10 text-slate-400 hover:border-white/30'}`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                        <input 
                            type="text" 
                            placeholder="Or type custom genre..."
                            value={genre}
                            onChange={e => setGenre(e.target.value)}
                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-indigo-500 outline-none placeholder-slate-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Musical Style / Vibe</label>
                            <div className="relative">
                                <Sliders className="absolute left-3 top-3 text-slate-500" size={16} />
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. Slow tempo, acoustic guitar..."
                                    value={style}
                                    onChange={e => setStyle(e.target.value)}
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Emotional Mood</label>
                            <div className="relative">
                                <Mic2 className="absolute left-3 top-3 text-slate-500" size={16} />
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. Heartbroken, Energetic..."
                                    value={mood}
                                    onChange={e => setMood(e.target.value)}
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Song Topic / Story</label>
                        <textarea 
                            required
                            rows={3}
                            placeholder="What is this song about? (e.g. Overcoming a difficult challenge through faith...)"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none"
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 transition-all mt-4"
                    >
                        <FileText size={20} /> Generate Song & Lyrics
                    </button>
                </form>
            )}

            {step === 'generating' && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <Loader2 size={64} className="text-indigo-400 animate-spin mb-6" />
                    <h3 className="text-xl font-bold text-white mb-2">Writing Lyrics...</h3>
                    <p className="text-slate-400 animate-pulse">Structuring verses, chorus, and composing style guide.</p>
                </div>
            )}

            {step === 'result' && result && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-white mb-2">{result.title}</h2>
                        <div className="flex justify-center gap-2 text-sm text-indigo-300 mb-4">
                            <span className="bg-white/10 px-3 py-1 rounded-full">{genre}</span>
                            <span className="bg-white/10 px-3 py-1 rounded-full">{mood}</span>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5 mb-6">
                        <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Sliders size={14} /> Production Style Guide
                        </h4>
                        <p className="text-slate-300 text-sm leading-relaxed italic">
                            {result.styleGuide}
                        </p>
                    </div>

                    <div className="bg-slate-800/80 rounded-xl p-8 border border-white/10 shadow-inner relative mb-6">
                        <button 
                            onClick={copyToClipboard}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            title="Copy Lyrics"
                        >
                            <Copy size={20} />
                        </button>
                        <pre className="whitespace-pre-wrap font-sans text-slate-200 leading-relaxed text-center">
                            {result.lyrics}
                        </pre>
                    </div>

                    <div className="flex gap-4 sticky bottom-0 bg-slate-900 pt-4 pb-2 border-t border-white/5 flex-wrap">
                        <button 
                            onClick={() => setStep('config')}
                            className="flex-1 min-w-[100px] bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors"
                        >
                            Edit
                        </button>
                        <button 
                            onClick={handleDownloadCard}
                            className="flex-1 min-w-[120px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Download size={18} /> Card
                        </button>
                        <button 
                            onClick={handleSaveToLibrary}
                            className="flex-[2] min-w-[150px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
                        >
                            <Save size={18} /> Save to Lib
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MusicGenerator;
