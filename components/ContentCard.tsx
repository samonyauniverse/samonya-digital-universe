import React, { useState } from 'react';
import { ContentItem } from '../types';
import { Play, Lock, Music, FileText, ThumbsUp, Heart, ThumbsDown, MessageSquare, Send, Quote } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SchemaMarkup from './SchemaMarkup';
import { Link } from '../context/AppContext';

interface Props {
  item: ContentItem;
}

const ContentCard: React.FC<Props> = ({ item }) => {
  const { user, interactWithContent, addComment } = useApp();
  const isLocked = item.isPremium && !user?.isPremium;
  const [activeInteractions, setActiveInteractions] = useState<{
    like: boolean;
    love: boolean;
    dislike: boolean;
  }>({ like: false, love: false, dislike: false });

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const playSound = (type: 'pop' | 'sweet' | 'negative') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      osc.connect(gain);

      const now = ctx.currentTime;

      if (type === 'pop') {
        osc.frequency.value = 800;
        gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.1);
        osc.start();
        osc.stop(now + 0.1);
      } else if (type === 'sweet') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start();
        osc.stop(now + 0.5);
      } else if (type === 'negative') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
        osc.start();
        osc.stop(now + 0.3);
      }
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  const handleInteraction = (type: 'like' | 'love' | 'dislike') => {
    if (type === 'dislike') {
        playSound('negative');
    } else if (type === 'love') {
        playSound('sweet');
    } else if (type === 'like') {
        playSound('pop');
    }
    
    setActiveInteractions(prev => ({ ...prev, [type]: true }));
    interactWithContent(item.id, type);
  };

  const toggleComments = () => {
      setShowComments(!showComments);
  };

  const submitComment = () => {
    if (!commentText.trim()) return;
    playSound('pop');
    addComment(item.id, commentText);
    setCommentText('');
  };

  // Render logic for Quotes
  if (item.type === 'quote') {
      return (
        <div className="bg-cyan-900/40 border border-cyan-500/30 p-6 rounded-xl flex flex-col justify-between h-full hover:bg-cyan-900/60 transition-colors shadow-lg shadow-cyan-900/20">
            <div className="mb-4">
                <Quote className="text-cyan-400 mb-2 rotate-180" size={24} />
                <p className="text-lg font-serif italic text-white/90 leading-relaxed">
                    {item.quoteText || `"${item.title}"`}
                </p>
                <Quote className="text-cyan-400 mt-2 ml-auto" size={24} />
            </div>
            <div className="flex justify-between items-center border-t border-cyan-500/20 pt-3">
                 <button onClick={() => handleInteraction('love')} className={`flex items-center gap-1 text-xs ${activeInteractions.love ? 'text-red-500' : 'text-slate-400 hover:text-pink-500'}`}>
                    <Heart size={14} fill={activeInteractions.love ? "currentColor" : "none"} /> {item.interactions.loves}
                 </button>
                 <span className="text-xs text-cyan-300 font-bold">MOTIVATIONAL HUB</span>
            </div>
        </div>
      );
  }

  return (
    <>
      <SchemaMarkup item={item} />
      <div className="group relative bg-slate-900 rounded-xl overflow-hidden border border-white/5 hover:border-pink-500/30 transition-all duration-300 shadow-lg flex flex-col h-full">
        {/* Wrap image in Link to Article View if it's an article */}
        <Link to={item.type === 'article' ? `/article/${item.id}` : '#'} className="relative aspect-video overflow-hidden shrink-0 block">
          <img 
            src={item.thumbnail} 
            alt={item.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {isLocked ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-slate-800/90 rounded-full flex items-center justify-center text-yellow-500">
                  <Lock size={20} />
                </div>
                <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">Subscribe to View</span>
              </div>
            ) : (
              <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-pink-600/50 scale-0 group-hover:scale-100 transition-transform duration-300 cursor-pointer">
                 {item.type === 'music' ? <Music size={20} /> : item.type === 'article' ? <FileText size={20} /> : <Play size={20} fill="currentColor" />}
              </div>
            )}
          </div>

          {item.isPremium && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
              PREMIUM
            </div>
          )}
        </Link>

        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.brandId}</span>
            <span className="text-xs text-slate-600">{new Date(item.date).toLocaleDateString()}</span>
          </div>
          
          <Link to={item.type === 'article' ? `/article/${item.id}` : '#'} className="block">
             <h3 className="font-bold text-white mb-1 line-clamp-1 group-hover:text-pink-400 transition-colors">{item.title}</h3>
          </Link>
          <p className="text-sm text-slate-400 line-clamp-2 mb-3">{item.description}</p>
          
          <div className="flex justify-between items-center mt-auto pt-3 border-t border-white/5">
             <div className="flex gap-4">
               {/* Like Button */}
               <button 
                onClick={() => handleInteraction('like')}
                className={`flex items-center gap-1 text-xs transition-colors ${activeInteractions.like ? 'text-blue-500' : 'text-slate-400 hover:text-blue-400'}`}
               >
                 <ThumbsUp size={14} fill={activeInteractions.like ? "currentColor" : "none"} /> {item.interactions.likes}
               </button>

               {/* Comment Toggle Button */}
               <button 
                onClick={toggleComments}
                className={`flex items-center gap-1 text-xs transition-colors ${showComments ? 'text-pink-500' : 'text-slate-400 hover:text-white'}`}
               >
                 <MessageSquare size={14} fill={showComments ? "currentColor" : "none"} /> {item.interactions.comments}
               </button>
               
               {/* Love Button */}
               <button 
                onClick={() => handleInteraction('love')}
                className={`flex items-center gap-1 text-xs transition-colors ${activeInteractions.love ? 'text-red-500' : 'text-slate-400 hover:text-pink-500'}`}
               >
                 <Heart size={14} fill={activeInteractions.love ? "currentColor" : "none"} /> {item.interactions.loves}
               </button>

               {/* Dislike Button */}
               <button 
                onClick={() => handleInteraction('dislike')}
                className={`flex items-center gap-1 text-xs transition-colors p-1 rounded-full ${
                    activeInteractions.dislike 
                        ? 'text-black bg-slate-200' 
                        : 'text-slate-400 hover:text-red-400'
                }`}
               >
                 <ThumbsDown size={14} fill={activeInteractions.dislike ? "currentColor" : "none"} /> 
                 {item.interactions.dislikes > 0 && <span className={activeInteractions.dislike ? 'text-black' : ''}>{item.interactions.dislikes}</span>}
               </button>
             </div>
             
             <span className="text-xs text-slate-600">{item.views.toLocaleString()} views</span>
          </div>

          {/* Comment Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2">
                <h4 className="text-xs font-bold text-slate-300 mb-3">Comments</h4>
                
                {/* Scrollable Comment List */}
                <div className="max-h-40 overflow-y-auto pr-2 space-y-3 mb-3 custom-scrollbar">
                    {item.commentList && item.commentList.length > 0 ? (
                        item.commentList.map((comment) => (
                            <div key={comment.id} className="flex gap-2">
                                <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${comment.avatarColor || 'bg-slate-600'}`}>
                                    {comment.userName.charAt(0).toUpperCase()}
                                </div>
                                <div className="bg-slate-800 p-2 rounded-lg rounded-tl-none w-full border border-white/5">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-slate-300">{comment.userName}</span>
                                        <span className="text-[10px] text-slate-500">{new Date(comment.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-slate-400">{comment.text}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-slate-500 italic text-center">No comments yet. Be the first!</p>
                    )}
                </div>

                {/* Comment Input */}
                <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={user ? "Add a comment..." : "Comment as Guest..."}
                      className="flex-1 bg-slate-800 border border-white/10 rounded-full px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                    />
                    <button 
                      onClick={submitComment} 
                      disabled={!commentText.trim()}
                      className="p-2 bg-pink-600 rounded-full text-white hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send size={12} />
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContentCard;