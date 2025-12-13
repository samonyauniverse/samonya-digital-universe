
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, Type, Settings, FlipHorizontal, ArrowLeft, Edit3, MoveVertical } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const Teleprompter: React.FC<Props> = ({ onClose }) => {
  const [text, setText] = useState("Welcome to Samonya Live!\n\nThis is your professional teleprompter.\n\nPaste your script here.\n\nAdjust speed, font size, and mirroring in the settings.\n\nKeep your eyes on the camera and speak naturally.\n\nGood luck!");
  const [isEditing, setIsEditing] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const [fontSize, setFontSize] = useState(48);
  const [isMirrored, setIsMirrored] = useState(false);
  const [opacity, setOpacity] = useState(0.8);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scrolling Logic
  useEffect(() => {
    let animationFrameId: number;

    const scroll = () => {
      if (scrollContainerRef.current && isPlaying) {
        scrollContainerRef.current.scrollTop += scrollSpeed * 0.5;
        
        // Loop or stop at bottom? Let's just stop at bottom for now
        if (scrollContainerRef.current.scrollTop + scrollContainerRef.current.clientHeight >= scrollContainerRef.current.scrollHeight) {
           setIsPlaying(false);
        } else {
           animationFrameId = requestAnimationFrame(scroll);
        }
      }
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(scroll);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, scrollSpeed]);

  return (
    <div className={`absolute inset-0 z-50 flex flex-col transition-colors duration-300`} style={{ backgroundColor: `rgba(0,0,0,${isEditing ? 0.95 : opacity})` }}>
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <h3 className="text-white font-bold flex items-center gap-2">
           <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> PRO PROMPTER
        </h3>
        <div className="flex gap-2">
            {!isEditing && (
                <button 
                    onClick={() => setIsEditing(true)} 
                    className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white"
                    title="Edit Script"
                >
                    <Edit3 size={20} />
                </button>
            )}
            <button 
                onClick={onClose} 
                className="p-2 hover:bg-red-600 rounded-full text-slate-300 hover:text-white transition-colors"
                title="Close Prompter"
            >
                <X size={20} />
            </button>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 relative overflow-hidden">
        
        {isEditing ? (
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-full bg-transparent text-white p-8 text-lg font-mono resize-none focus:outline-none placeholder-slate-600"
                placeholder="Paste your script here..."
            />
        ) : (
            <>
                {/* Reading Guide Marker */}
                <div className="absolute top-1/2 left-0 right-0 h-10 border-y border-red-500/30 bg-red-500/10 z-10 pointer-events-none flex items-center justify-between px-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>

                {/* Scroller */}
                <div 
                    ref={scrollContainerRef}
                    className="w-full h-full overflow-y-auto no-scrollbar scroll-smooth relative"
                    style={{ 
                        transform: isMirrored ? 'scaleX(-1)' : 'none',
                    }}
                >
                    {/* Spacer to allow start at middle */}
                    <div style={{ height: '50%' }}></div>
                    
                    <p 
                        className="px-8 font-bold text-center leading-normal transition-all duration-300 select-none text-white drop-shadow-md"
                        style={{ fontSize: `${fontSize}px` }}
                    >
                        {text}
                    </p>
                    
                    {/* Spacer to allow end at middle */}
                    <div style={{ height: '50%' }}></div>
                </div>
            </>
        )}
      </div>

      {/* --- CONTROLS --- */}
      <div className="p-4 bg-slate-900 border-t border-white/10 flex flex-col gap-4">
        
        {isEditing ? (
             <button 
                onClick={() => setIsEditing(false)}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 uppercase tracking-widest"
             >
                <Play size={18} fill="currentColor" /> Start Prompter
             </button>
        ) : (
            <>
                <div className="flex items-center justify-between gap-4">
                    {/* Play/Pause */}
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`p-4 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-slate-700 text-white' : 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]'}`}
                    >
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                    </button>

                    {/* Settings Group */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 bg-black/30 p-3 rounded-xl border border-white/5">
                        
                        {/* Speed */}
                        <div className="flex flex-col justify-center">
                            <label className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1 mb-1">
                                <MoveVertical size={10} /> Speed
                            </label>
                            <input 
                                type="range" 
                                min="0" max="10" step="0.5"
                                value={scrollSpeed} 
                                onChange={(e) => setScrollSpeed(Number(e.target.value))}
                                className="w-full accent-red-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Font Size */}
                        <div className="flex flex-col justify-center">
                            <label className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1 mb-1">
                                <Type size={10} /> Size
                            </label>
                            <input 
                                type="range" 
                                min="20" max="120" step="4"
                                value={fontSize} 
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                className="w-full accent-red-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Opacity */}
                        <div className="flex flex-col justify-center">
                            <label className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1 mb-1">
                                <Settings size={10} /> Opacity
                            </label>
                            <input 
                                type="range" 
                                min="0" max="1" step="0.1"
                                value={opacity} 
                                onChange={(e) => setOpacity(Number(e.target.value))}
                                className="w-full accent-red-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Mirror Toggle */}
                        <button 
                            onClick={() => setIsMirrored(!isMirrored)}
                            className={`flex flex-col items-center justify-center rounded p-1 ${isMirrored ? 'bg-red-500/20 text-red-400' : 'text-slate-400 hover:text-white'}`}
                        >
                            <FlipHorizontal size={20} />
                            <span className="text-[10px] font-bold uppercase mt-1">Mirror</span>
                        </button>

                    </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default Teleprompter;
