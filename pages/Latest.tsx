
import React, { useState, useMemo, useEffect } from 'react';
import { useApp, useLocation, useNavigate, Link } from '../context/AppContext';
import ContentCard from '../components/ContentCard';
import { Search, X, Compass, TrendingUp, ArrowLeft } from 'lucide-react';

const Latest: React.FC = () => {
  const { content } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  
  // Parse query param from "pathname" (which is actually hash path)
  // e.g., "/latest?q=foo"
  const initialSearch = useMemo(() => {
      const parts = pathname.split('?q=');
      return parts.length > 1 ? decodeURIComponent(parts[1]) : '';
  }, [pathname]);

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  
  // Sync state if URL changes (though mostly for initial load)
  useEffect(() => {
      const parts = pathname.split('?q=');
      if (parts.length > 1) {
          setSearchTerm(decodeURIComponent(parts[1]));
      }
  }, [pathname]);

  const safeContent = useMemo(() => Array.isArray(content) ? content : [], [content]);

  const filteredContent = useMemo(() => {
      return safeContent.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [safeContent, searchTerm]);

  // Suggested content when search yields no results (Sort by popularity/views)
  const suggestedContent = useMemo(() => {
    return [...safeContent].sort((a, b) => b.views - a.views).slice(0, 6);
  }, [safeContent]);
  
  const displayContent = searchTerm && filteredContent.length > 0 ? filteredContent : safeContent;
  const showFallback = searchTerm && filteredContent.length === 0;

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
                <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft size={16} /> Back to Universe
                </Link>
                <h1 className="text-4xl font-bold text-white mb-2">
                    {searchTerm ? `Search Results` : 'Latest Releases'}
                </h1>
                <p className="text-slate-400">
                    {searchTerm 
                        ? `Found ${filteredContent.length} matches for "${searchTerm}"`
                        : 'Fresh content from across the Samonya Digital Universe'
                    }
                </p>
            </div>

            <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="text-slate-500" size={18} />
                </div>
                <input 
                    type="text" 
                    placeholder="Search content..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-white/20 rounded-full py-3 pl-10 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-white"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
        </div>

        {showFallback ? (
            <div className="animate-in fade-in duration-500">
                <div className="bg-slate-800/50 border border-white/10 rounded-xl p-12 text-center mb-12">
                     <Search size={64} className="mx-auto text-slate-600 mb-6" />
                     <h3 className="text-2xl font-bold text-white mb-2">No exact matches found</h3>
                     <p className="text-slate-400 mb-8">We couldn't find anything matching "{searchTerm}". Try checking your spelling or use different keywords.</p>
                     <button onClick={() => setSearchTerm('')} className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline text-lg">Clear Search</button>
                </div>

                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Compass size={20} className="text-purple-400"/> You might like these instead
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suggestedContent.map(item => (
                        <ContentCard key={item.id} item={item} />
                    ))}
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayContent.map(item => (
                    <ContentCard key={item.id} item={item} />
                ))}
            </div>
        )}
    </div>
  );
};

export default Latest;
