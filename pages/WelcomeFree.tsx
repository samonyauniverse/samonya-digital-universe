
import React from 'react';
import { useNavigate } from '../context/AppContext';

const WelcomeFree: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4 text-center animate-in fade-in duration-700 relative overflow-hidden">
        {/* Background Ambient Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-xs font-bold tracking-[0.2em] uppercase mb-6 animate-in slide-in-from-top-4 duration-1000">
                Access Granted
            </div>

            <h1 className="text-5xl md:text-8xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500 drop-shadow-2xl tracking-tight leading-tight animate-in zoom-in duration-1000">
                WELCOME <br/> EXPLORER
            </h1>
            
            <p className="text-lg text-slate-400 mb-12 max-w-xl mx-auto leading-relaxed animate-in slide-in-from-bottom-4 duration-1000 delay-200">
                You have unlocked the gateway to the Samonya Digital Universe. Prepare for infinite creativity.
            </p>
            
            <button 
              onClick={() => navigate('/')}
              className="px-12 py-6 bg-white text-black font-black text-xl rounded-full hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] relative z-10 flex items-center gap-3 group mx-auto animate-in slide-in-from-bottom-8 duration-1000 delay-300"
            >
                Enter the universe for free
                <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
            </button>
        </div>
    </div>
  );
};

export default WelcomeFree;
