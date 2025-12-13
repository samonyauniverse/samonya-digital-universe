
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BRANDS } from '../constants';
import BrandCard from '../components/BrandCard';
import PricingSection from '../components/PricingSection';
import { useApp, useNavigate } from '../context/AppContext';
import { Sparkles, ArrowDown, Search, X, TrendingUp, Compass, Cpu, Zap } from 'lucide-react';

const Home: React.FC = () => {
  const { content } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const safeContent = useMemo(() => Array.isArray(content) ? content : [], [content]);

  // Autocomplete Suggestions
  const suggestions = useMemo(() => {
    if (!searchTerm) return [];
    const allTitles = safeContent.map(c => c.title || '');
    const allTags = Array.from(new Set(safeContent.flatMap(c => c.tags || [])));
    const combined = [...allTitles, ...allTags];
    return combined.filter(s => s && s.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);
  }, [searchTerm, safeContent]);

  const trendingSearches = ['AI Music', 'Funny Skits', 'Kids Education', 'News'];

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
        searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Click outside to close suggestions
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
              setShowSuggestions(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSection = (id: string) => {
    setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
  };

  const handleSearchSelect = (term: string) => {
      navigate(`/latest?q=${encodeURIComponent(term)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        navigate(`/latest?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleExploreBrands = (e: React.MouseEvent) => {
      e.preventDefault();
      scrollToSection('brands');
  };

  return (
    <div className="flex flex-col bg-[#020617] text-samonya-soft-lilac min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4">
        
        {/* Animated Multiverse Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Dark Base */}
            <div className="absolute inset-0 bg-[#020617]"></div>
            
            {/* AI & TV: Cyan/Blue Glow (Top Left) */}
            <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-cyan-600/20 rounded-full blur-[120px] animate-blob mix-blend-screen" />
            
            {/* Dream Eye & Sky: Pink/Fuchsia/Purple (Top Right) */}
            <div className="absolute -top-[10%] -right-[10%] w-[50vw] h-[50vw] bg-fuchsia-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen" />
            
            {/* Kids & Motivation: Green/Amber (Bottom Left) */}
            <div className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] bg-emerald-500/10 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-screen" />
            
            {/* Comedy & Live: Orange/Red (Bottom Right) */}
            <div className="absolute -bottom-[20%] -right-[10%] w-[50vw] h-[50vw] bg-red-600/15 rounded-full blur-[120px] animate-blob animation-delay-6000 mix-blend-screen" />
            
            {/* Center Core: Indigo/Violet (Samonya Core) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse" />

            {/* Grid Pattern Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto w-full">
          
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 text-white leading-none drop-shadow-[0_0_25px_rgba(77,76,255,0.5)] animate-in fade-in zoom-in duration-1000">
            WELCOME TO <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400">THE UNIVERSE</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-samonya-soft-lilac/80 mb-10 max-w-3xl mx-auto leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            The Ultimate Digital Reality. Where artificial intelligence meets creativity, entertainment, and infinite possibilities.
          </p>

          {/* Search Trigger */}
          <div className="mb-12 h-16 relative flex justify-center items-center z-50 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300" ref={searchContainerRef}>
             {!isSearchOpen ? (
                 <button 
                    onClick={() => {
                        setIsSearchOpen(true);
                        setShowSuggestions(true);
                    }}
                    className="group bg-white/5 backdrop-blur-xl border border-white/20 rounded-full py-4 px-8 text-white hover:bg-white/10 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-300 flex items-center gap-3"
                 >
                    <Search size={24} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span className="text-samonya-soft-lilac group-hover:text-white">Search the Universe...</span>
                 </button>
             ) : (
                 <div className="relative w-full max-w-lg animate-in fade-in zoom-in duration-300">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="text-cyan-400" size={20} />
                        </div>
                        <input 
                        ref={searchInputRef}
                        type="text" 
                        placeholder="Search universe..." 
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-[#0F0529]/90 backdrop-blur-md border border-cyan-500/50 rounded-full py-4 pl-12 pr-12 text-white text-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)] relative z-20"
                        />
                        <button 
                            onClick={() => {
                                setIsSearchOpen(false);
                                setSearchTerm('');
                                setShowSuggestions(false);
                            }}
                            className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-white z-20"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Autocomplete / Suggestions Dropdown */}
                    {showSuggestions && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0F0529]/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl overflow-hidden z-10 animate-in slide-in-from-top-2">
                            {searchTerm ? (
                                <ul>
                                    {suggestions.length > 0 ? (
                                        suggestions.map((s, idx) => (
                                            <li 
                                                key={idx} 
                                                onClick={() => handleSearchSelect(s)}
                                                className="px-4 py-3 hover:bg-white/10 hover:text-cyan-400 cursor-pointer text-left flex items-center gap-3 border-b border-white/5 last:border-0"
                                            >
                                                <Search size={14} className="text-slate-500" />
                                                <span dangerouslySetInnerHTML={{
                                                    __html: s.replace(new RegExp(searchTerm, 'gi'), (match) => `<span class="font-bold text-white">${match}</span>`)
                                                }} className="text-samonya-soft-lilac" />
                                            </li>
                                        ))
                                    ) : (
                                        <div className="p-4 text-slate-500 text-sm italic">No direct matches found. Press enter to search anyway.</div>
                                    )}
                                </ul>
                            ) : (
                                <div>
                                    <div className="px-4 py-2 bg-white/5 text-xs font-bold text-slate-400 uppercase tracking-wider">Trending Now</div>
                                    <ul>
                                        {trendingSearches.map((t, idx) => (
                                            <li 
                                                key={idx} 
                                                onClick={() => handleSearchSelect(t)}
                                                className="px-4 py-3 hover:bg-white/10 hover:text-cyan-400 cursor-pointer text-left flex items-center gap-3 border-b border-white/5 last:border-0"
                                            >
                                                <TrendingUp size={14} className="text-cyan-400" />
                                                <span className="text-samonya-soft-lilac">{t}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                 </div>
             )}
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <button 
                onClick={handleExploreBrands}
                className="px-8 py-4 bg-samonya-future-violet text-white font-bold rounded-full hover:shadow-[0_0_30px_rgba(106,0,255,0.6)] transition-all transform hover:scale-105 flex items-center gap-2 border border-white/10"
            >
              <Compass size={20} /> Explore Universe
            </button>
            <button 
                onClick={() => navigate('/latest')}
                className="px-8 py-4 bg-transparent text-white font-bold rounded-full hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all backdrop-blur-sm border border-white/20 flex items-center gap-2"
            >
              <Zap size={20} className="text-yellow-400"/> Latest Releases
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-cyan-400">
            <ArrowDown size={24} />
        </div>
      </section>

      {/* Brands Grid - Heptagon Layout */}
      <section id="brands" className="py-20 px-4 w-full bg-slate-950/80 scroll-mt-20 border-t border-white/5 relative">
        {/* Subtle background glow for section */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none"></div>
        
        <div className="text-center mb-12 relative z-10">
            <h2 className="text-3xl font-bold mb-2 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Select a Dimension</h2>
            <p className="text-samonya-soft-lilac/70">Choose a brand to begin your journey.</p>
        </div>
        {/* Responsive Grid: 3 columns on mobile, 4 on md, 5 on lg */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-6 max-w-7xl mx-auto relative z-10">
        {(BRANDS || []).map(brand => (
            <div key={brand.id} className="transform hover:z-10 transition-all duration-300">
                <BrandCard brand={brand} />
            </div>
        ))}
        </div>
      </section>

      {/* Pricing Section */}
      <div className="border-t border-white/5 bg-black/60 backdrop-blur-sm">
        <PricingSection />
      </div>

    </div>
  );
};

export default Home;
