
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandId, ContentType } from '../types';
import { BRANDS } from '../constants';
import { generateSeoData } from '../services/geminiService';
import { Wand2, Loader2, Save, Video, Users, CreditCard, Trash2, Edit, UploadCloud } from 'lucide-react';

const Admin: React.FC = () => {
  const { user, addContent, content } = useApp();
  const [activeTab, setActiveTab] = useState<'content' | 'users' | 'subs'>('content');

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<ContentType>('video');
  const [brand, setBrand] = useState<BrandId>(BrandId.MILELE);
  const [tags, setTags] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Strict Admin Email Check
  const adminEmails = ['snmomanyik@gmail.com', 'samonyadigital@gmail.com'];
  const isAuthorized = user && user.isAdmin && adminEmails.includes(user.email.toLowerCase());

  if (!isAuthorized) {
    return <div className="p-20 text-center text-red-500 font-bold text-xl">Access Denied. Admins Only.</div>;
  }

  const handleGenerateSEO = async () => {
    if (!title) return;
    setIsGenerating(true);
    try {
      const data = await generateSeoData(title, `${type} content for brand ${brand}`);
      if (data.description) setDesc(data.description);
      if (data.tags && Array.isArray(data.tags)) setTags(data.tags.join(', '));
    } catch (e) {
      alert("Failed to generate SEO. Check console.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        // 500MB in bytes = 500 * 1024 * 1024
        if (selectedFile.size > 500 * 1024 * 1024) {
            alert("File size exceeds 500MB limit. Please choose a smaller file.");
            e.target.value = '';
            return;
        }
        setFile(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
        alert("Please select a file to upload.");
        return;
    }

    addContent({
      id: Date.now().toString(),
      title,
      description: desc,
      thumbnail: `https://picsum.photos/800/450?random=${Date.now()}`,
      brandId: brand,
      type,
      isPremium,
      date: new Date().toISOString(),
      tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [],
      views: 0,
      interactions: { likes: 0, loves: 0, dislikes: 0, comments: 0 },
      commentList: []
    });
    
    // Trigger Notification if permission granted
    if (Notification.permission === 'granted') {
       new Notification('New Content Alert', {
         body: `New ${type} uploaded: ${title} on SAMONYA UNIVERSE!`,
         icon: '/favicon.ico'
       });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                 new Notification('New Content Alert', {
                    body: `New ${type} uploaded: ${title} on SAMONYA UNIVERSE!`,
                    icon: '/favicon.ico'
                 });
            }
        });
    }
    
    // Reset Form
    setTitle('');
    setDesc('');
    setTags('');
    setFile(null);
    alert("Content Uploaded Successfully & Notification Sent!");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
         <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
         <div className="flex gap-2 mt-4 md:mt-0">
             <button 
                onClick={() => setActiveTab('content')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'content' ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400'}`}
             >
                <Video size={18} /> Content
             </button>
             <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'users' ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400'}`}
             >
                <Users size={18} /> Users
             </button>
             <button 
                onClick={() => setActiveTab('subs')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'subs' ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400'}`}
             >
                <CreditCard size={18} /> Subscriptions
             </button>
         </div>
      </div>

      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Form */}
            <div className="bg-slate-800 p-6 rounded-xl border border-white/5 h-fit">
                <h2 className="text-xl font-bold mb-6 text-pink-400">Upload New Content</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* File Input */}
                    <div>
                        <label className="block text-xs font-medium mb-1 text-slate-400">Content File (Max 500MB)</label>
                        <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:border-pink-500/50 transition-colors bg-slate-900 group">
                            <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-2 group-hover:bg-slate-700 transition-colors">
                                    <UploadCloud className="text-slate-400 group-hover:text-pink-400" size={24} />
                                </div>
                                <span className="text-sm text-slate-300 font-medium truncate max-w-[200px]">{file ? file.name : "Click to select file"}</span>
                                <span className="text-xs text-slate-500 mt-1">Video, Audio, or Article</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium mb-1 text-slate-400">Brand</label>
                            <select value={brand} onChange={e => setBrand(e.target.value as BrandId)} className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-white text-sm">
                                {(BRANDS || []).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1 text-slate-400">Type</label>
                            <select value={type} onChange={e => setType(e.target.value as ContentType)} className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-white text-sm">
                                <option value="video">Video</option>
                                <option value="music">Music</option>
                                <option value="article">Article / News</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                         <label className="block text-xs font-medium mb-1 text-slate-400">Title</label>
                         <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-white" />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-medium text-slate-400">Description</label>
                            <button type="button" onClick={handleGenerateSEO} disabled={!title || isGenerating} className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1">
                                {isGenerating ? <Loader2 size={10} className="animate-spin"/> : <Wand2 size={10} />} Auto-SEO
                            </button>
                        </div>
                        <textarea rows={3} value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-white text-sm" />
                    </div>

                    <div>
                         <label className="block text-xs font-medium mb-1 text-slate-400">Tags</label>
                         <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-white text-sm" placeholder="tag1, tag2" />
                    </div>

                    <div className="flex items-center">
                        <input type="checkbox" checked={isPremium} onChange={e => setIsPremium(e.target.checked)} className="accent-pink-500 mr-2" />
                        <span className="text-sm text-slate-300">Premium Content</span>
                    </div>

                    <button type="submit" className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2">
                        <Save size={16} /> Publish
                    </button>
                </form>
            </div>

            {/* Content List */}
            <div className="bg-slate-800 p-6 rounded-xl border border-white/5">
                <h2 className="text-xl font-bold mb-6 text-white">Manage Library</h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {Array.isArray(content) && content.map(item => (
                        <div key={item.id} className="flex gap-4 p-3 bg-slate-900 rounded-lg hover:bg-slate-900/80">
                            <img src={item.thumbnail} alt="" className="w-24 h-16 object-cover rounded bg-slate-800" />
                            <div className="flex-grow">
                                <h4 className="font-bold text-white text-sm line-clamp-1">{item.title}</h4>
                                <div className="flex gap-2 text-xs text-slate-500 mt-1">
                                    <span className="uppercase">{item.brandId}</span>
                                    <span>•</span>
                                    <span>{item.isPremium ? 'Premium' : 'Free'}</span>
                                    <span>•</span>
                                    <span>{item.views} views</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button className="p-1 text-slate-400 hover:text-blue-400"><Edit size={16} /></button>
                                <button className="p-1 text-slate-400 hover:text-red-400"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {activeTab === 'users' && (
          <div className="bg-slate-800 p-8 rounded-xl border border-white/5 text-center">
              <Users size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">User Management</h3>
              <p className="text-slate-400">List of registered users would appear here in a real application.</p>
          </div>
      )}

      {activeTab === 'subs' && (
          <div className="bg-slate-800 p-8 rounded-xl border border-white/5 text-center">
              <CreditCard size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Subscription Analytics</h3>
              <p className="text-slate-400">Revenue charts and subscriber churn rates would appear here.</p>
          </div>
      )}
    </div>
  );
};

export default Admin;
