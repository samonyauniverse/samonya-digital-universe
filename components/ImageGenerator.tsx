
import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Loader2, Download, Sparkles, Wand2, Upload } from 'lucide-react';
import { generateImage } from '../services/geminiService';

interface Props {
  onClose: () => void;
}

const ImageGenerator: React.FC<Props> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
        const resultBase64 = await generateImage(prompt, referenceImage || undefined);
        if (resultBase64) {
            setGeneratedImage(resultBase64);
        } else {
            alert("Failed to generate image. Please try a different prompt.");
        }
    } catch (e) {
        console.error("Generation failed", e);
        alert("An error occurred during generation.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
      if (!generatedImage) return;
      try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = generatedImage;
          await new Promise((resolve) => { img.onload = resolve; });

          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Draw Image
          ctx.drawImage(img, 0, 0);

          // --- WATERMARK LOGIC ---
          const logoSize = Math.min(canvas.width, canvas.height) * 0.15;
          const padding = logoSize * 0.2;
          const x = canvas.width - logoSize - padding;
          const y = canvas.height - logoSize - padding;

          ctx.save();
          ctx.shadowColor = "rgba(0,0,0,0.8)";
          ctx.shadowBlur = 8;

          // Logo Box (Rounded)
          const grad = ctx.createLinearGradient(x, y, x + logoSize, y + logoSize);
          grad.addColorStop(0, "#06b6d4");
          grad.addColorStop(0.5, "#ec4899");
          grad.addColorStop(1, "#f59e0b");
          ctx.lineWidth = logoSize * 0.08;
          ctx.strokeStyle = grad;
          
          ctx.beginPath();
          const r = logoSize * 0.2; // radius
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + logoSize - r, y);
          ctx.quadraticCurveTo(x + logoSize, y, x + logoSize, y + r);
          ctx.lineTo(x + logoSize, y + logoSize - r);
          ctx.quadraticCurveTo(x + logoSize, y + logoSize, x + logoSize - r, y + logoSize);
          ctx.lineTo(x + r, y + logoSize);
          ctx.quadraticCurveTo(x, y + logoSize, x, y + logoSize - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
          ctx.stroke();

          // Logo 'S'
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
          ctx.textAlign = "right";
          ctx.textBaseline = "middle";
          ctx.font = `900 ${logoSize * 0.4}px 'Outfit', sans-serif`;
          ctx.fillText("SAMONYA", x - padding, y + (logoSize * 0.35));
          
          ctx.font = `700 ${logoSize * 0.25}px 'Outfit', sans-serif`;
          ctx.fillStyle = "#ec4899"; 
          ctx.fillText("DIGITAL UNIVERSE", x - padding, y + (logoSize * 0.65));
          
          ctx.restore();
          // --- END WATERMARK ---

          const url = canvas.toDataURL("image/png");
          const a = document.createElement('a');
          a.href = url;
          a.download = `Samonya_Visual_${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
      } catch (e) {
          console.error(e);
          alert("Download failed.");
      }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = () => {
              setReferenceImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-slate-900 border border-purple-500/20 rounded-2xl max-w-lg w-full flex flex-col shadow-[0_0_50px_rgba(168,85,247,0.1)] relative overflow-hidden">
        
        {/* Background FX */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center shadow-lg border border-purple-500/30">
               <ImageIcon className="text-purple-400" size={20} />
            </div>
            <div>
               <h2 className="text-xl font-bold text-white leading-tight">Visual Creativity</h2>
               <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Powered by Gemini Imaging</p>
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
        <div className="p-6">
            {!generatedImage && !isGenerating && !referenceImage && (
                <div className="text-center py-8">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="text-purple-400 opacity-50" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Imagine Anything</h3>
                    <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto">Describe your vision in detail, and Samonya AI will render it into reality.</p>
                </div>
            )}

            <form onSubmit={handleGenerate} className="relative z-20 space-y-4">
                {/* Reference Image Preview */}
                {referenceImage && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/20 mb-2 group">
                        <img src={referenceImage} alt="Ref" className="w-full h-full object-cover" />
                        <button 
                            type="button" 
                            onClick={() => { setReferenceImage(null); if(fileInputRef.current) fileInputRef.current.value=''; }}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                <div className="relative">
                    <input 
                        type="text" 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="A futuristic city made of crystal..."
                        className="w-full bg-slate-800 border border-white/20 rounded-xl pl-4 pr-24 py-4 text-white focus:outline-none focus:border-purple-500 shadow-inner"
                        disabled={isGenerating}
                    />
                    <div className="absolute right-2 top-2 bottom-2 flex gap-1">
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isGenerating}
                            className="bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg px-3 flex items-center justify-center transition-all disabled:opacity-50"
                            title="Upload Reference Image"
                        >
                            <Upload size={18} />
                        </button>
                        <button 
                            type="submit"
                            disabled={!prompt.trim() || isGenerating}
                            className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg px-3 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
                        </button>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileSelect} 
                    />
                </div>
            </form>

            {/* Result Area */}
            {(generatedImage || isGenerating) && (
                <div className="mt-6">
                    <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                        {isGenerating ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Loader2 size={48} className="text-purple-500 animate-spin mb-4" />
                                <span className="text-xs text-slate-500 animate-pulse">Synthesizing Pixels...</span>
                            </div>
                        ) : (
                            <img src={generatedImage!} alt="Generated" className="w-full h-full object-contain animate-in fade-in duration-700" />
                        )}
                    </div>
                    
                    {generatedImage && (
                        <button 
                            onClick={handleDownload}
                            className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <Download size={18} /> Download Image
                        </button>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
