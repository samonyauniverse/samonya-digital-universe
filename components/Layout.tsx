
import React, { useState } from 'react';
import { Link, useLocation } from '../context/AppContext';
import { Menu, X, Settings, Facebook, Instagram, Youtube, Radio, ChevronRight, User as UserIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BRANDS } from '../constants';
import ChatBot from './ChatBot';

// Mini SDU Logo Component for Navbar - Updated to "Digital Universe" Identity
const MiniLogo = () => (
  <svg viewBox="0 0 100 100" className="w-11 h-11 drop-shadow-xl overflow-visible group-hover:scale-110 transition-transform duration-500">
    <defs>
        <linearGradient id="brandRainbow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />   {/* Cyan (AI) */}
            <stop offset="20%" stopColor="#a855f7" />   {/* Purple (Academy) */}
            <stop offset="40%" stopColor="#ec4899" />   {/* Pink (Sky) */}
            <stop offset="60%" stopColor="#ef4444" />   {/* Red (Live) */}
            <stop offset="80%" stopColor="#f59e0b" />   {/* Amber (Motivation) */}
            <stop offset="100%" stopColor="#22c55e" />  {/* Green (Kids) */}
        </linearGradient>
        
        {/* Deep Cosmic Void Background */}
        <radialGradient id="cosmicVoid" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#1e1b4b" /> {/* Dark Indigo */}
            <stop offset="100%" stopColor="#000000" /> {/* Black */}
        </radialGradient>

        {/* Neon Glow Filter */}
        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
    </defs>

    {/* The Universe Box */}
    <rect x="10" y="10" width="80" height="80" rx="22" fill="url(#cosmicVoid)" stroke="url(#brandRainbow)" strokeWidth="5" />
    
    {/* Digital Stars */}
    <circle cx="25" cy="25" r="1.5" fill="white" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="75" cy="80" r="1" fill="#22d3ee" opacity="0.7" />
    <circle cx="80" cy="30" r="1.5" fill="#ec4899" opacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite" />
    </circle>
    <circle cx="20" cy="70" r="1" fill="white" opacity="0.5" />

    {/* The 'S' - Pure Digital Light */}
    <path 
        d="M 65 35 C 35 35 35 50 50 50 C 65 50 65 65 35 65" 
        stroke="white" 
        strokeWidth="6" 
        strokeLinecap="round" 
        fill="none" 
        filter="url(#neonGlow)"
        className="drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
    />
  </svg>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useApp();
  const location = useLocation();

  const isKidsPage = location.pathname.includes('kids');
  // Updated dark background to #0A001A (samonya-cosmic)
  const navbarClass = isKidsPage 
    ? "bg-yellow-400 text-purple-900 font-kids shadow-xl" 
    : "bg-[#0A001A]/80 backdrop-blur-xl border-b border-white/5 text-samonya-soft-lilac";
  
  // Specific emails allowed to see admin
  const adminEmails = ['snmomanyik@gmail.com', 'samonyadigital@gmail.com'];
  const showAdmin = user && user.isAdmin && adminEmails.includes(user.email.toLowerCase());

  // Hide Navbar and Footer on Login AND Profile page for a clean look
  if (location.pathname === '/login' || location.pathname === '/profile') {
      return (
        <div className="min-h-screen flex flex-col bg-[#0A001A] text-samonya-soft-lilac font-sans selection:bg-samonya-neon-blue selection:text-white">
            <main className="flex-grow flex items-center justify-center p-4">
                {children}
            </main>
        </div>
      );
  }

  // Rainbow Text Class - Vibrant and High Contrast
  const rainbowTextClass = "text-transparent bg-clip-text bg-[linear-gradient(to_right,#22d3ee,#a855f7,#ec4899,#ef4444,#f59e0b,#22c55e)]";

  return (
    <div className="min-h-screen flex flex-col bg-[#0A001A] text-samonya-soft-lilac font-sans selection:bg-samonya-neon-blue selection:text-white">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${navbarClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Identity */}
            <Link to="/" className="flex items-center gap-3 group">
              <MiniLogo />
              <div className="flex flex-col">
                  <span className={`text-xl font-black tracking-tighter leading-none ${rainbowTextClass} drop-shadow-sm group-hover:brightness-125 transition-all`}>
                    SAMONYA
                  </span>
                  <span className={`text-[10px] font-bold tracking-[0.2em] uppercase leading-none opacity-90 ${rainbowTextClass} drop-shadow-sm`}>
                    Digital Universe
                  </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
              <Link to="/" className={`hover:text-samonya-neon-blue transition-colors ${isKidsPage ? 'text-purple-900' : ''}`}>Home</Link>
              <Link to="/about" className={`hover:text-samonya-neon-blue transition-colors ${isKidsPage ? 'text-purple-900' : ''}`}>About</Link>
              <Link to="/live" className="text-red-500 hover:text-red-400 transition-colors flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  Live
              </Link>
              <Link to="/blog" className={`hover:text-samonya-neon-blue transition-colors ${isKidsPage ? 'text-purple-900' : ''}`}>Blog</Link>
              
              {user ? (
                <div className={`flex items-center gap-4 ml-4 pl-4 border-l ${isKidsPage ? 'border-purple-900/20' : 'border-white/10'}`}>
                  {showAdmin && (
                    <Link to="/admin" className="flex items-center gap-1 text-xs bg-purple-900/50 hover:bg-purple-800 text-purple-200 px-3 py-1.5 rounded-full border border-purple-500/30 transition-all">
                      <Settings size={12} /> Admin
                    </Link>
                  )}
                  <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="text-right hidden lg:block">
                        <div className={`text-xs font-bold ${isKidsPage ? 'text-purple-900' : 'text-white'}`}>{user.name}</div>
                        <div className="text-[10px] text-samonya-neon-blue">{user.isPremium ? 'Premium' : 'Explorer'}</div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-samonya-neon-blue to-samonya-future-violet flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(106,0,255,0.5)] border border-white/10 overflow-hidden">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            user.name.charAt(0).toUpperCase()
                        )}
                    </div>
                  </Link>
                </div>
              ) : (
                <Link to="/login" className="bg-white text-black px-5 py-2 rounded-full text-xs font-bold hover:bg-samonya-soft-lilac transition-colors shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  Join SDU
                </Link>
              )}
            </div>

            {/* Mobile Menu & Profile Shortcut */}
            <div className="md:hidden flex items-center gap-3">
              <Link to={user ? "/profile" : "/login"} className="relative group">
                  <div className={`w-9 h-9 rounded-full p-[2px] shadow-lg transition-all ${user ? 'bg-gradient-to-tr from-samonya-neon-blue to-samonya-future-violet shadow-samonya-neon-blue/40' : 'bg-white/10 border border-white/10'}`}>
                      <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
                          {user ? (
                              user.avatar ? (
                                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                  <span className="text-xs font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                              )
                          ) : (
                              <UserIcon size={16} className="text-slate-400" />
                          )}
                      </div>
                  </div>
              </Link>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-2 ${isKidsPage ? 'text-purple-900' : 'text-white'}`}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-[#0A001A] border-b border-white/10 shadow-2xl animate-in slide-in-from-top-2">
            <div className="flex flex-col p-4 space-y-2">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="p-3 rounded-lg hover:bg-white/5 flex items-center justify-between">
                  Home <ChevronRight size={16} className="opacity-50"/>
              </Link>
              <Link to="/live" onClick={() => setIsMenuOpen(false)} className="p-3 rounded-lg hover:bg-white/5 text-red-500 font-bold flex items-center justify-between">
                  Live Stream <Radio size={16} />
              </Link>
              
              <div className="h-px bg-white/10 my-2"></div>
              <p className="text-xs text-slate-500 font-bold uppercase px-3 mb-1">Dimensions</p>
              
              <div className="grid grid-cols-2 gap-2">
                {(BRANDS || []).map(b => (
                  <Link 
                    key={b.id} 
                    to={b.route} 
                    onClick={() => setIsMenuOpen(false)} 
                    className="text-xs px-3 py-2 bg-white/5 rounded border border-white/5 hover:border-samonya-neon-blue/30 text-samonya-soft-lilac"
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
              
              <div className="h-px bg-white/10 my-2"></div>
              
              {!user ? (
                 <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full text-center p-3 rounded-lg bg-samonya-future-violet text-white font-bold">Sign In / Join</Link>
              ) : (
                 <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="w-full text-center p-3 rounded-lg bg-white/10 text-white font-bold flex items-center justify-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-samonya-neon-blue"></div>}
                    </div>
                    My Profile
                 </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-16">
        {children}
      </main>

      {/* Chat Bot */}
      <ChatBot />

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-16 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-4">
                <MiniLogo />
                <span className={`text-xl font-black tracking-tighter ${rainbowTextClass}`}>SDU</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              The ultimate digital destination. AI-powered entertainment, education, and innovation for the next generation.
            </p>
          </div>

          <div className="flex flex-col gap-4">
             <h4 className="text-white font-bold text-sm uppercase tracking-widest">Connect</h4>
             <div className="flex gap-4 items-center">
                <a href="https://www.facebook.com/share/1DJUz23eKr/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors"><Facebook size={20} /></a>
                <a href="https://x.com/SamonyaDU?t=Ul5b1lM81AxJgM7J_Ov3Hg&s=09" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a href="https://www.instagram.com/samonyadigitaluniverse?igsh=ZDJrdHgweTNwNHVh" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors"><Instagram size={20} /></a>
                <a href="https://youtube.com/@samonyadigitaluniverse?si=dR8PDhmrDUct3ztF" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-red-600 transition-colors"><Youtube size={20} /></a>
             </div>
             <p className="text-xs text-slate-500">@samonyadigitaluniverse</p>
          </div>

          <div className="flex flex-col gap-3 text-sm text-slate-400">
             <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-1">Legal</h4>
             <Link to="/privacy" className="hover:text-samonya-neon-blue transition-colors">Privacy Policy</Link>
             <Link to="/terms" className="hover:text-samonya-neon-blue transition-colors">Terms of Service</Link>
             <Link to="/contact" className="hover:text-samonya-neon-blue transition-colors">Support Center</Link>
          </div>
        </div>
        
        <div className="border-t border-white/5 mt-12 pt-8 text-center">
           <p className="text-slate-600 text-xs">
              © {new Date().getFullYear()} Samonya Digital Universe. All rights reserved. Powered by Samonya AI.
           </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
