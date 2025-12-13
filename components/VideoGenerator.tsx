
import React, { useState } from 'react';
import { BrandId, ContentItem } from '../types';
import { generateVideoConcept } from '../services/geminiService';
import { useApp } from '../context/AppContext';
import { X, Video, Clapperboard, Loader2, PlayCircle, Check, Music, FileText, Download } from 'lucide-react';

interface Props {
  brandId: BrandId;
  brandName: string;
  onClose: () => void;
  onSuccess: (id: string) => void;
}

const VideoGenerator: React.FC<Props> = ({ brandId, brandName, onClose, onSuccess }) => {
  const { addContent } = useApp();
  const [step, setStep] = useState<'topic' | 'generating' | 'review' | 'rendering' | 'complete'>('topic');
  const [topic, setTopic] = useState('');
  const [videoPlan, setVideoPlan] = useState<any>(null);
  const [generatedItemId, setGeneratedItemId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setStep('generating');
    try {
      const result = await generateVideoConcept(topic, brandId);
      setVideoPlan(result);
      setStep('review');
    } catch (error) {
      console.error(error);
      alert("Failed to generate video plan. Please try again.");
      setStep('topic');
    }
  };

  const handleCreateVideo = async () => {
    setStep('rendering');
    
    // Use Pollinations for the visual
    const thumbUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(topic + " cinematic video scene 4k")}&width=1280&height=720&nologo=true`;

    // Simulate Video Rendering Process - Shortened to 2.5s for better UX
    setTimeout(() => {
      const newItem: ContentItem = {
        id: `gen-vid-${Date.now()}`,
        title: videoPlan?.title || topic,
        description: videoPlan?.description || "AI Generated Video",
        thumbnail: thumbUrl, 
        brandId: brandId,
        type: 'video',
        isPremium: false,
        date: new Date().toISOString(),
        tags: ['AI Video', 'Generated', brandId],
        views: 0,
        interactions: { likes: 0, loves: 0, dislikes: 0, comments: 0 },
        commentList: []
      };

      addContent(newItem);
      setGeneratedItemId(newItem.id);
      setStep('complete');
      onSuccess(newItem.id);
    }, 2500);
  };

  // Canvas processing to burn watermark into the image (simulating video frame download)
  const processVideoWithWatermark = async (imageUrl: string): Promise<string> => {
      return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = imageUrl;
          img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                  reject("Canvas context not supported");
                  return;
              }

              // 1. Draw original image
              ctx.drawImage(img, 0, 0);

              // 2. Setup Watermark Specs
              const logoSize = Math.min(canvas.width, canvas.height) * 0.12;
              const padding = logoSize * 0.2;
              const x = 50;
              const y = canvas.height - logoSize - 50;

              // Logo Box
              const grad = ctx.createLinearGradient(x, y, x + logoSize, y + logoSize);
              grad.addColorStop(0, "#06b6d4");
              grad.addColorStop(0.5, "#ec4899");
              grad.addColorStop(1, "#f59e0b");
              
              ctx.lineWidth = logoSize * 0.08;
              ctx.strokeStyle = grad;
              ctx.beginPath();
              const r = logoSize * 0.2;
              ctx.moveTo(x + r, y);
              ctx.lineTo(x + logoSize - r, y);
              ctx.quadraticCurveTo(x + logoSize, y, x + logoSize, y + r);
              ctx.lineTo(x + logoSize, y + logoSize - r);
              ctx.quadraticCurveTo(x + logoSize, y + logoSize, x + logoSize - r, y + logoSize);
              ctx.lineTo(x + r, y + logoSize);
              ctx.quadraticCurveTo(x, y + logoSize, x, y + logoSize - r);
              ctx.lineTo(x, y + r);
              ctx.quadraticCurveTo(x, y, x + r, y);
              ctx.stroke();

              // S
              const s = (val: number) => (val / 100) * logoSize;
              ctx.lineWidth = logoSize * 0.06;
              ctx.strokeStyle = 'white';
              ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo(x + s(65), y + s(35));
              ctx.bezierCurveTo(x + s(35), y + s(35), x + s(35), y + s(50), x + s(50), y + s(50));
              ctx.bezierCurveTo(x + s(65), y + s(50), x + s(65), y + s(65), x + s(35), y + s(65));
              ctx.stroke();

              // Text
              ctx.fillStyle = "white";
              ctx.textAlign = "left";
              ctx.textBaseline = "middle";
              ctx.font = `900 ${logoSize * 0.4}px 'Outfit', sans-serif`;
              ctx.fillText("SAMONYA", x + logoSize + padding, y + (logoSize * 0.35));
              
              ctx.font = `700 ${logoSize * 0.25}px 'Outfit', sans-serif`;
              ctx.fillStyle = "#ec4899";
              ctx.fillText("DIGITAL UNIVERSE", x + logoSize + padding, y + (logoSize * 0.65));

              resolve(canvas.toDataURL('image/jpeg', 0.95));
          };
          img.onerror = (e) => reject(e);
      });
  };

  const handleDownload = async () => {
      setIsDownloading(true);
      try {
          // Get the preview URL
          const thumbUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(topic + " cinematic video scene 4k")}&width=1280&height=720&nologo=true`;
          
          // Process image to add watermark via canvas
          const watermarkedDataUrl = await processVideoWithWatermark(thumbUrl);
          
          // Convert Data URL to Blob
          const res = await fetch(watermarkedDataUrl);
          const blob = await res.blob();

          // Create download link
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          // Giving it an .mp4 extension for simulation purposes as requested by user, 
          // though technically it's a watermarked JPEG frame.
          const filename = `SDU_${(videoPlan?.title || 'Video').replace(/[^a-z0-9]/gi, '_').substring(0, 20)}_Watermarked.mp4`;
          a.download = filename; 
          
          document.body.appendChild(a);
          a.click();
          
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
      } catch (e) {
          console.error(e);
          alert("Download failed. Please try again.");
      } finally {
          setIsDownloading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full flex flex-col max-h-[90vh] shadow-2xl relative overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
               <Video className="text-white" size={20} />
            </div>
            <div>
               <h2 className="text-xl font-bold text-white leading-tight">SAMONYA Video Studio</h2>
               <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">{brandName} Production</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 z-10 custom-scrollbar">
          
          {step === 'topic' && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 animate-pulse">
                <Clapperboard className="text-slate-400" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">What's the video about?</h3>
              <p className="text-slate-400 mb-8 max-w-md">Provide a topic, and Samonya AI will generate a script, scene breakdown, and visual prompts instantly.</p>
              
              <form onSubmit={handleGeneratePlan} className="w-full max-w-md">
                <input 
                  type="text" 
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder={`E.g. A futuristic music video for ${brandName}...`}
                  className="w-full bg-slate-800 border border-white/20 rounded-full px-6 py-4 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 shadow-xl transition-all"
                  autoFocus
                />
                <button 
                  type="submit" 
                  disabled={!topic.trim()}
                  className="mt-6 w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Video size={20} /> Generate Concept
                </button>
              </form>
            </div>
          )}

          {step === 'generating' && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Loader2 size={64} className="text-pink-500 animate-spin mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">Consulting Samonya AI Director...</h3>
              <p className="text-slate-400 animate-pulse">Drafting script, selecting scenes, and preparing visuals.</p>
            </div>
          )}

          {step === 'review' && videoPlan && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{videoPlan.title}</h3>
                    <p className="text-slate-400 text-sm">{videoPlan.description}</p>
                  </div>
                  <button 
                    onClick={handleCreateVideo}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                  >
                    <PlayCircle size={20} /> Render Video
                  </button>
               </div>

               <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5 mb-6">
                  <h4 className="text-sm font-bold text-pink-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FileText size={14} /> Script / Voiceover
                  </h4>
                  <p className="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    {videoPlan.script}
                  </p>
               </div>

               <div className="space-y-4">
                  <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <Clapperboard size={14} /> Scene Breakdown
                  </h4>
                  {videoPlan.scenes.map((scene: any, idx: number) => (
                    <div key={idx} className="flex gap-4 p-4 bg-slate-800 rounded-lg border border-white/5 hover:border-white/20 transition-colors">
                        <div className="text-xs font-bold text-slate-500 w-16 pt-1">{scene.time}</div>
                        <div className="flex-1">
                            <p className="text-white text-sm mb-1"><span className="text-purple-400 font-bold">Visual:</span> {scene.visual}</p>
                            <p className="text-slate-400 text-xs"><span className="text-blue-400 font-bold">Audio:</span> {scene.audio}</p>
                        </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {step === 'rendering' && (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                    <Video className="absolute inset-0 m-auto text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Rendering Final Cut...</h3>
                <p className="text-slate-400">Applying filters, syncing audio, and generating thumbnail.</p>
             </div>
          )}

          {step === 'complete' && (
             <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-green-500/50">
                    <Check className="text-white" size={48} strokeWidth={4} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Production Complete!</h3>
                <p className="text-slate-400 mb-8">"{videoPlan?.title}" has been added to the {brandName} library.</p>
                
                {/* VIDEO PREVIEW SIMULATION */}
                <div className="relative aspect-video w-full max-w-md bg-black rounded-xl overflow-hidden mb-8 border border-white/20 shadow-2xl">
                    <img 
                        src={`https://image.pollinations.ai/prompt/${encodeURIComponent(topic + " cinematic video scene 4k")}&width=800&height=450&nologo=true`} 
                        alt="Preview" 
                        className="w-full h-full object-cover opacity-80"
                        crossOrigin="anonymous"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle size={64} className="text-white opacity-80" />
                    </div>

                    {/* WATERMARK PREVIEW (HTML Overlay - Simplified White for Review) */}
                    <div className="absolute bottom-[25%] left-6 flex flex-col items-start p-3 bg-black/70 backdrop-blur-sm border border-white/10 rounded-lg z-20">
                         <h1 className="text-[20px] font-black text-white leading-none tracking-tighter drop-shadow-lg font-sans uppercase">SAMONYA DIGITAL UNIVERSE</h1>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={onClose}
                        className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-full transition-colors"
                    >
                        Close Studio
                    </button>
                    <button 
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
                    >
                        {isDownloading ? <Loader2 className="animate-spin" /> : <Download />} Download Video
                    </button>
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;
