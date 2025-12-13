
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from '../context/AppContext';
import { BRANDS, BRAND_ICONS } from '../constants';
import { useApp } from '../context/AppContext';
import { BrandId, ContentItem } from '../types';
import ContentCard from '../components/ContentCard';
import PricingSection from '../components/PricingSection';
import MusicGenerator from '../components/MusicGenerator';
import ImageGenerator from '../components/ImageGenerator';
import { Sparkles, Loader2, Quote, Copy, Lightbulb, Moon, Send, Play, Eye, Plus, FileText, X, Video, Rocket, Download, Bot, Code2, Zap, RefreshCw, StopCircle, RotateCcw, PanelLeftClose, PanelLeftOpen, Trash2, Paperclip, ArrowRight, ArrowLeft, Image as ImageIcon, GraduationCap, Brain, BookOpen, Layers, BarChart, Users, Mail, Bed, Smile, Calculator, Delete, Heart, Activity, Compass, Fingerprint, Anchor, Music, Mic, Terminal, MessageSquare, CheckCircle2, ChevronDown, ChevronUp, Mic2, Briefcase, TrendingUp, DollarSign, PenTool, Scale, Building2 } from 'lucide-react';
import { generateMotivationalQuote, generateDreamAnalysis, generateArticleMetadata, chatWithSamonyaAI, consultAcademy, generateImage, generateHolyScripture, generateBusinessTool } from '../services/geminiService';
import DreamEyeLogo from '../components/DreamEyeLogo';
import ReactMarkdown from 'react-markdown';

const BrandPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { filterContentByBrand, addContent, user } = useApp();
  
  // Access Control: Redirect to login if user is not authenticated
  if (!user) {
      return <Navigate to="/login" replace />;
  }

  const brand = (BRANDS || []).find(b => b.route.includes(id || ''));
  const [activeTab, setActiveTab] = useState<string>('All');
  
  // Generator State
  const [genTopic, setGenTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuote, setGeneratedQuote] = useState<{quote: string, author: string} | null>(null);

  // Article Generator State
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [articleTopic, setArticleTopic] = useState('');

  // Music/Lyrics Generator State
  const [showMusicModal, setShowMusicModal] = useState(false);

  // Scripture Generator State (Milele)
  const [showScriptureModal, setShowScriptureModal] = useState(false);
  const [scriptureTopic, setScriptureTopic] = useState('');
  const [scriptureResult, setScriptureResult] = useState<{text: string, reference: string, insight: string} | null>(null);
  const [displayedScripture, setDisplayedScripture] = useState(''); // For typewriter effect

  // Image Generator State
  const [showImageModal, setShowImageModal] = useState(false);

  // Dream Eye State
  const [dreamInput, setDreamInput] = useState('');
  const [dreamResult, setDreamResult] = useState<{
      summary: string;
      symbols: { name: string, meaning: string }[];
      emotions: { fear: number, hope: number, stress: number, transformation: number, intuition: number };
      archetype: string;
      archetypeReason: string;
      subconsciousMeaning: string;
      lifeApplication: string;
      dreamUniverseVisual: string;
      visualPrompt: string;
      futureInsight?: string;
  } | null>(null);
  const [isDownloadingDream, setIsDownloadingDream] = useState(false);

  // Samonya Academy State
  const [academyMode, setAcademyMode] = useState<string>(''); // Empty = Dashboard
  const [academyInput, setAcademyInput] = useState('');
  const [academyHistory, setAcademyHistory] = useState<{type: 'user'|'bot', text: string}[]>([]);
  const academyScrollRef = useRef<HTMLDivElement>(null);
  
  // Math Solver Specific State
  const [mathDetail, setMathDetail] = useState<'concise' | 'detailed'>('detailed');
  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState("");

  // Samonya AI V6 State
  const [aiMode, setAiMode] = useState<'chat' | 'code' | 'strategy'>('chat');
  const [aiMessages, setAiMessages] = useState<{
      sender: 'user'|'ai', 
      text: string, 
      imageUrl?: string // Stores Base64 or URL for display
  }[]>([
      { sender: 'ai', text: "### Samonya AI V6 Online\n\nI am your advanced intelligence companion. Ready to think, create, and solve." }
  ]);
  const [aiInput, setAiInput] = useState('');
  
  // Business Matrix State
  const [bizTool, setBizTool] = useState<'dashboard' | 'builder' | 'capital' | 'brand' | 'profit' | 'legal' | 'hr' | 'academy'>('dashboard');
  const [bizInputs, setBizInputs] = useState<any>({});
  const [bizResult, setBizResult] = useState<any>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);

  // Image Upload State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const aiInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const brandContent = useMemo(() => {
    if (!brand) return [];
    let content = filterContentByBrand(brand.id);
    if (!Array.isArray(content)) return [];
    if (activeTab !== 'All') {
       content = content.filter(item => item.type.toLowerCase() === activeTab.toLowerCase());
    }
    return content;
  }, [brand, filterContentByBrand, activeTab]);

  useEffect(() => {
     if (chatEndRef.current) {
         chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
     }
  }, [aiMessages, imagePreview]);

  // Scroll Academy to bottom
  useEffect(() => {
    if (academyScrollRef.current) {
        academyScrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [academyHistory]);

  // Typewriter effect for scripture
  useEffect(() => {
    if (scriptureResult?.text) {
        let i = 0;
        setDisplayedScripture('');
        const interval = setInterval(() => {
            setDisplayedScripture(scriptureResult.text.substring(0, i + 1));
            i++;
            if (i > scriptureResult.text.length) clearInterval(interval);
        }, 30); // Speed of typing
        return () => clearInterval(interval);
    }
  }, [scriptureResult]);

  if (!brand) return <div className="text-center py-20 text-white">Brand not found</div>;

  const Icon = BRAND_ICONS[brand.id];
  const isLight = brand.id === BrandId.MILELE || brand.id === BrandId.KIDS;
  const isMotivation = brand.id === BrandId.MOTIVATION;
  const isDreamEye = brand.id === BrandId.DREAM_EYE;
  const isSamonyaAI = brand.id === BrandId.SAMONYA_AI;
  const isAcademy = brand.id === BrandId.ACADEMY;
  const isBusiness = brand.id === BrandId.BUSINESS_MATRIX;

  // Motivation Handlers
  const handleGenerateQuote = async (topic: string) => {
      const targetTopic = topic || genTopic;
      if (!targetTopic.trim()) return;

      setIsGenerating(true);
      setGenTopic(targetTopic);
      try {
          const result = await generateMotivationalQuote(targetTopic);
          setGeneratedQuote(result);
      } catch (error) {
          console.error(error);
      } finally {
          setIsGenerating(false);
      }
  };

  const motivationTags = [
      "Life", "Business", "Success", "Health", "Support", "Religious", "Believe", "Love", "Discipline", "Focus"
  ];

  // Helper for generic watermarked download
  const processAndDownloadImage = async (imageUrl: string, filename: string) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas not supported");

      ctx.drawImage(img, 0, 0);

      // --- WATERMARK LOGIC (Standardized) ---
      const logoSize = Math.min(canvas.width, canvas.height) * 0.15;
      const padding = logoSize * 0.2;
      const x = canvas.width - logoSize - padding;
      const y = canvas.height - logoSize - padding;

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 8;

      // Box
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
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.font = `900 ${logoSize * 0.4}px 'Outfit', sans-serif`;
      ctx.fillText("SAMONYA", x - padding, y + (logoSize * 0.35));
      
      ctx.font = `700 ${logoSize * 0.25}px 'Outfit', sans-serif`;
      ctx.fillStyle = "#ec4899";
      ctx.fillText("DIGITAL UNIVERSE", x - padding, y + (logoSize * 0.65));
      
      ctx.restore();
      // --- END WATERMARK ---

      const watermarkedUrl = canvas.toDataURL("image/jpeg", 0.95);

      const res = await fetch(watermarkedUrl);
      const blob = await res.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
  };

  // Dream Handlers
  const handleAnalyzeDream = async () => {
     if (!dreamInput.trim()) return;
     setIsGenerating(true);
     try {
         const result = await generateDreamAnalysis(dreamInput);
         setDreamResult(result);
     } catch (e) {
         console.error(e);
     } finally {
         setIsGenerating(false);
     }
  };

  const handleDownloadDream = async () => {
      if (!dreamResult) return;
      setIsDownloadingDream(true);
      
      try {
          const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(dreamResult.visualPrompt + " surreal dream 4k")}&width=800&height=1000&nologo=true`;
          await processAndDownloadImage(imageUrl, `Samonya_Dream_Visual_${Date.now()}.jpg`);
      } catch (e) {
          console.error(e);
          alert("Download failed. Please try again.");
      } finally {
          setIsDownloadingDream(false);
      }
  };
  
  const handleDownloadQuote = async () => {
     if (!generatedQuote) return;
     const canvas = document.createElement('canvas');
     canvas.width = 1080;
     canvas.height = 1080;
     const ctx = canvas.getContext('2d');
     if(!ctx) return;
     
     // Background
     const grad = ctx.createLinearGradient(0,0, 1080, 1080);
     grad.addColorStop(0, '#1e293b');
     grad.addColorStop(1, '#0f172a');
     ctx.fillStyle = grad;
     ctx.fillRect(0,0,1080,1080);
     
     // Quote Text
     ctx.fillStyle = "white";
     ctx.font = "italic 60px serif";
     ctx.textAlign = "center";
     
     // Wrap text
     const words = generatedQuote.quote.split(' ');
     let line = '';
     let y = 400;
     for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 900 && n > 0) {
            ctx.fillText(line, 540, y);
            line = words[n] + ' ';
            y += 80;
        } else {
            line = testLine;
        }
     }
     ctx.fillText(line, 540, y);
     
     // Author
     ctx.font = "bold 40px sans-serif";
     ctx.fillStyle = "#fbbf24"; // Amber
     ctx.fillText(`- ${generatedQuote.author}`, 540, y + 100);

     // --- WATERMARK START ---
     const logoSize = 150;
     const x = 50;
     const yLog = 1080 - logoSize - 50;
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
     
     // Render watermarked version from this canvas
     const rawUrl = canvas.toDataURL("image/jpeg");
     const a = document.createElement('a');
     a.href = rawUrl;
     a.download = `Samonya_Quote_${Date.now()}.jpg`;
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
  };

  // Scripture Generation Handler
  const handleGenerateScripture = async () => {
      setIsGenerating(true);
      setScriptureResult(null);
      setDisplayedScripture('');
      try {
          const result = await generateHolyScripture(scriptureTopic || 'Random Inspiration');
          setScriptureResult(result);
      } catch (e) {
          console.error(e);
          alert("Failed to reveal scripture.");
      } finally {
          setIsGenerating(false);
      }
  };

  // Academy Handlers
  const handleAcademySearch = async (query: string) => {
      if (!query.trim()) return;
      
      setAcademyHistory(prev => [...prev, { type: 'user', text: query }]);
      setAcademyInput('');
      setIsGenerating(true);

      try {
          const modeToSend = academyMode === 'math' ? `math-${mathDetail}` : (academyMode || 'quick');
          const result = await consultAcademy(query, modeToSend);
          setAcademyHistory(prev => [...prev, { type: 'bot', text: result }]);
      } catch (error) {
          console.error(error);
          setAcademyHistory(prev => [...prev, { type: 'bot', text: "Connection to Academy Archives Failed." }]);
      } finally {
          setIsGenerating(false);
      }
  };

  // Calculator Functions
  const handleCalcPress = (val: string) => {
      if (val === 'C') {
          setCalcInput("");
          setCalcResult("");
      } else if (val === 'DEL') {
          setCalcInput(prev => prev.slice(0, -1));
      } else if (val === '=') {
          try {
              let evalString = calcInput
                  .replace(/sin/g, 'Math.sin')
                  .replace(/cos/g, 'Math.cos')
                  .replace(/tan/g, 'Math.tan')
                  .replace(/sqrt/g, 'Math.sqrt')
                  .replace(/\^/g, '**')
                  .replace(/pi/g, 'Math.PI');
              
              // eslint-disable-next-line no-new-func
              const res = new Function('return ' + evalString)();
              setCalcResult(res.toString());
          } catch (e) {
              setCalcResult("Error");
          }
      } else {
          setCalcInput(prev => prev + val);
      }
  };

  // Academy Download
  const handleDownloadAcademyReport = () => {
      const report = academyHistory.map(h => `${h.type === 'user' ? 'YOU' : 'SAMONYA ACADEMY'}:\n${h.text}\n\n`).join('-------------------\n\n');
      const blob = new Blob([report], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Samonya_Research_Report_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
  };

  // Article Generation
  const handleGenerateArticle = async () => {
    if (!articleTopic.trim()) return;
    setIsGenerating(true);
    try {
        const metadata = await generateArticleMetadata(articleTopic, brand.id);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(metadata.thumbnailPrompt)}&width=800&height=450&nologo=true`;
        
        const newItem: ContentItem = {
            id: `gen-art-${Date.now()}`,
            title: metadata.title,
            description: metadata.description,
            thumbnail: imageUrl,
            brandId: brand.id,
            type: 'article',
            isPremium: false,
            date: new Date().toISOString(),
            tags: metadata.tags,
            views: 0,
            interactions: { likes: 0, loves: 0, dislikes: 0, comments: 0 },
            commentList: []
        };
        addContent(newItem);
        setShowArticleModal(false);
        navigate(`/article/${newItem.id}`);
    } catch (e) {
        console.error(e);
    } finally {
        setIsGenerating(false);
    }
  };

  // --- BUSINESS MATRIX HANDLERS ---
  const handleBizGenerate = async () => {
      setIsGenerating(true);
      setBizResult(null);
      setLogoImage(null); // Reset logo on new generation
      
      let inputs = { ...bizInputs };
      
      try {
          const result = await generateBusinessTool(bizTool as any, inputs);
          setBizResult(result);
      } catch (e) {
          console.error(e);
          setBizResult("Error generated business content.");
      } finally {
          setIsGenerating(false);
      }
  };

  const updateBizInput = (key: string, value: string) => {
      setBizInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerateLogo = async () => {
    if (!bizResult) return;
    setIsGeneratingLogo(true);
    try {
        const prompt = `Professional logo design for a ${bizInputs.industry} brand. 
        Vibe: ${bizInputs.vibe}. 
        Style description: ${bizResult.logoStyle}. 
        Vector graphic, flat design, white background, high quality.`;
        
        const base64 = await generateImage(prompt);
        if (base64) {
            setLogoImage(base64);
        } else {
             alert("Logo generation failed. Please try again.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsGeneratingLogo(false);
    }
  };

  const handleDownloadLogo = () => {
      if (!logoImage) return;
      const a = document.createElement('a');
      a.href = logoImage;
      a.download = `Samonya_Logo_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  // --- SAMONYA AI CHAT LOGIC ---

  // Handle Feature Switching for Samonya AI
  const switchAiMode = (mode: 'chat' | 'code' | 'strategy') => {
      setAiMode(mode);
      setAiMessages([
          { 
              sender: 'ai', 
              text: mode === 'chat' 
                  ? "### Natural Chat Active\n\nI'm ready for a deep, context-aware conversation. What's on your mind?"
                  : mode === 'code'
                  ? "### Advanced Coding Module Online\n\nI can generate, debug, and optimize complex codebases and databases. How can I assist you?"
                  : "### Strategic Analysis Protocol\n\nI am ready to break down problems and formulate actionable plans. What challenge are we tackling?"
          }
      ]);
      document.getElementById('chat-interface')?.scrollIntoView({ behavior: 'smooth' });
  };

  const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
      });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setSelectedImage(file);
          const url = URL.createObjectURL(file);
          setImagePreview(url);
          if (aiInputRef.current) aiInputRef.current.focus();
      }
  };

  const clearSelectedImage = () => {
      setSelectedImage(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (text: string, imageFile?: File) => {
      if (!text.trim() && !imageFile) return;
      
      let imageDataPart: { mimeType: string, data: string } | null = null;
      let displayImageUrl: string | undefined = undefined;

      if (imageFile) {
          try {
              const base64Full = await fileToBase64(imageFile);
              displayImageUrl = base64Full;
              const match = base64Full.match(/^data:(.+);base64,(.+)$/);
              if (match) {
                  imageDataPart = { mimeType: match[1], data: match[2] };
              }
          } catch (e) {
              console.error("Image processing error", e);
          }
      }

      setAiMessages(prev => [...prev, { sender: 'user', text: text, imageUrl: displayImageUrl }]);
      setIsGenerating(true);

      const history = aiMessages.map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
      }));

      // Pass the current mode to the service
      const response = await chatWithSamonyaAI(text, imageDataPart, history, aiMode);
      
      // Removed Auto-Image Generation Logic

      setAiMessages(prev => [...prev, { sender: 'ai', text: response, imageUrl: undefined }]);
      setIsGenerating(false);
  };

  const handleAiSend = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!aiInput.trim() && !selectedImage) return;
      const userText = aiInput;
      const userImage = selectedImage;
      setAiInput('');
      clearSelectedImage();
      if (aiInputRef.current) aiInputRef.current.style.height = 'auto';
      handleSendMessage(userText, userImage || undefined);
  };

  const handleAiRegenerate = async () => {
      if (aiMessages.length < 2) return;
      const lastUserMsg = aiMessages[aiMessages.length - 2];
      if (lastUserMsg.sender !== 'user') return; 

      setAiMessages(prev => prev.slice(0, -1));
      setIsGenerating(true);

      const history = aiMessages.slice(0, -2).map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
      }));
      
      const response = await chatWithSamonyaAI(lastUserMsg.text, null, history, aiMode);
      setAiMessages(prev => [...prev, { sender: 'ai', text: response }]);
      setIsGenerating(false);
  };

  const handleAiInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setAiInput(e.target.value);
      e.target.style.height = 'auto';
      e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleAiKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleAiSend();
      }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
  };

  // --- RENDERERS ---

  // 0. BUSINESS MATRIX RENDERER
  if (isBusiness) {
      const tools = [
          { id: 'dashboard', name: "Dashboard", icon: BarChart },
          { id: 'builder', name: "AI Builder", icon: Rocket },
          { id: 'capital', name: "Capital Finder", icon: DollarSign },
          { id: 'brand', name: "Branding Studio", icon: PenTool },
          { id: 'profit', name: "Profit Analyzer", icon: TrendingUp },
          { id: 'legal', name: "Legal Assist", icon: Scale },
          { id: 'hr', name: "HR Manager", icon: Users },
          { id: 'academy', name: "Academy", icon: GraduationCap },
      ];

      return (
          <div className="min-h-screen bg-[#0D1B2A] text-[#E0E6ED] font-sans flex flex-col md:flex-row">
              {/* Sidebar */}
              <div className="md:w-64 bg-[#1B263B] border-r border-[#00F5D4]/10 p-6 flex flex-col shrink-0">
                  <div className="flex items-center gap-2 mb-10">
                      <Briefcase className="text-[#00F5D4]" size={28} />
                      <h1 className="font-bold text-xl leading-tight text-white">BUSINESS <br/><span className="text-[#00F5D4] text-sm tracking-widest">MATRIX™</span></h1>
                  </div>
                  <nav className="space-y-2 flex-1">
                      {tools.map(t => (
                          <button
                              key={t.id}
                              onClick={() => { setBizTool(t.id as any); setBizResult(null); setLogoImage(null); }}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${bizTool === t.id ? 'bg-[#00F5D4] text-[#0D1B2A] font-bold shadow-[0_0_15px_rgba(0,245,212,0.4)]' : 'text-[#E0E6ED] hover:bg-white/5'}`}
                          >
                              <t.icon size={18} /> {t.name}
                          </button>
                      ))}
                  </nav>
                  <div className="pt-6 border-t border-white/5">
                      <div className="bg-[#0D1B2A] rounded-lg p-3 text-xs text-center border border-[#00F5D4]/20">
                          <p className="text-[#00F5D4] font-bold mb-1">Explorer Mode</p>
                          <button className="w-full bg-[#00F5D4]/10 hover:bg-[#00F5D4]/20 text-[#00F5D4] py-1 rounded transition-colors">Upgrade Plan</button>
                      </div>
                  </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6 md:p-10 overflow-y-auto">
                  
                  {/* DASHBOARD VIEW */}
                  {bizTool === 'dashboard' && (
                      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
                          <h2 className="text-3xl font-bold text-white mb-6">Executive Dashboard</h2>
                          
                          {/* Stats Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="bg-[#1B263B] p-6 rounded-2xl border border-[#00F5D4]/20 relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Activity size={64}/></div>
                                  <h3 className="text-[#00F5D4] text-sm font-bold uppercase tracking-wider mb-2">Business Health</h3>
                                  <div className="text-4xl font-black text-white">92<span className="text-lg text-slate-400">/100</span></div>
                                  <p className="text-xs text-slate-400 mt-2">Optimal performance detected.</p>
                              </div>
                              <div className="bg-[#1B263B] p-6 rounded-2xl border border-[#00F5D4]/20 relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><TrendingUp size={64}/></div>
                                  <h3 className="text-[#00F5D4] text-sm font-bold uppercase tracking-wider mb-2">Projected Growth</h3>
                                  <div className="text-4xl font-black text-white">+18%</div>
                                  <p className="text-xs text-slate-400 mt-2">Based on current market trends.</p>
                              </div>
                              <div className="bg-[#1B263B] p-6 rounded-2xl border border-[#00F5D4]/20 relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><DollarSign size={64}/></div>
                                  <h3 className="text-[#00F5D4] text-sm font-bold uppercase tracking-wider mb-2">Funding Chance</h3>
                                  <div className="text-4xl font-black text-white">High</div>
                                  <p className="text-xs text-slate-400 mt-2">Investors are active in your sector.</p>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              <div className="bg-[#1B263B] p-6 rounded-2xl border border-white/5">
                                  <h3 className="font-bold text-white mb-4">Quick Actions</h3>
                                  <div className="space-y-3">
                                      <button onClick={() => setBizTool('builder')} className="w-full text-left p-4 bg-[#0D1B2A] hover:bg-black/40 rounded-xl border border-white/5 flex items-center justify-between group transition-all">
                                          <span className="flex items-center gap-3"><Rocket className="text-[#00F5D4] group-hover:scale-110 transition-transform" /> Generate New Business Plan</span>
                                          <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </button>
                                      <button onClick={() => setBizTool('capital')} className="w-full text-left p-4 bg-[#0D1B2A] hover:bg-black/40 rounded-xl border border-white/5 flex items-center justify-between group transition-all">
                                          <span className="flex items-center gap-3"><DollarSign className="text-[#00F5D4] group-hover:scale-110 transition-transform" /> Find Investors</span>
                                          <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </button>
                                      <button onClick={() => setBizTool('legal')} className="w-full text-left p-4 bg-[#0D1B2A] hover:bg-black/40 rounded-xl border border-white/5 flex items-center justify-between group transition-all">
                                          <span className="flex items-center gap-3"><Scale className="text-[#00F5D4] group-hover:scale-110 transition-transform" /> Draft Legal Agreement</span>
                                          <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </button>
                                  </div>
                              </div>
                              <div className="bg-gradient-to-br from-[#1B263B] to-[#0D1B2A] p-6 rounded-2xl border border-[#00F5D4]/30 flex flex-col justify-center text-center">
                                  <div className="w-16 h-16 bg-[#00F5D4]/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                      <Bot className="text-[#00F5D4]" size={32} />
                                  </div>
                                  <h3 className="font-bold text-white text-lg mb-2">Samonya Matrix AI</h3>
                                  <p className="text-sm text-slate-400 mb-6">"Based on your recent activity, I recommend focusing on your Brand Identity before seeking capital."</p>
                                  <button onClick={() => setBizTool('brand')} className="bg-[#00F5D4] text-[#0D1B2A] font-bold py-3 rounded-full hover:bg-white transition-colors">
                                      Go to Branding Studio
                                  </button>
                              </div>
                          </div>
                      </div>
                  )}

                  {/* TOOL VIEWS (Generic Structure for all tools) */}
                  {bizTool !== 'dashboard' && (
                      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                              {tools.find(t => t.id === bizTool)?.icon && React.createElement(tools.find(t => t.id === bizTool)!.icon, { className: "text-[#00F5D4]" })}
                              {tools.find(t => t.id === bizTool)?.name}
                          </h2>
                          <p className="text-slate-400 mb-8 border-b border-white/10 pb-4">
                              {bizTool === 'builder' && "Create a roadmap for success. Generate detailed plans instantly."}
                              {bizTool === 'capital' && "Unlock funding opportunities. Create pitch decks and find grants."}
                              {bizTool === 'brand' && "Define your identity. Logos, names, and palettes."}
                              {bizTool === 'profit' && "Financial forecasting and break-even analysis."}
                              {bizTool === 'legal' && "Generate NDAs, contracts, and policies."}
                              {bizTool === 'hr' && "Manage your team, salaries, and job descriptions."}
                              {bizTool === 'academy' && "Master the art of business with expert lessons."}
                          </p>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              {/* Input Form */}
                              <div className="space-y-4">
                                  {bizTool === 'builder' && (
                                      <>
                                          <input type="text" placeholder="Industry (e.g. Fintech, Bakery)" className="w-full bg-[#1B263B] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#00F5D4]" onChange={e => updateBizInput('industry', e.target.value)} />
                                          <input type="text" placeholder="Target Audience" className="w-full bg-[#1B263B] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#00F5D4]" onChange={e => updateBizInput('audience', e.target.value)} />
                                          <input type="text" placeholder="Budget (e.g. $10k)" className="w-full bg-[#1B263B] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#00F5D4]" onChange={e => updateBizInput('budget', e.target.value)} />
                                          <textarea placeholder="Business Goals & Vision..." className="w-full bg-[#1B263B] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#00F5D4] h-32" onChange={e => updateBizInput('goals', e.target.value)} />
                                      </>
                                  )}
                                  {bizTool === 'capital' && (
                                      <>
                                          <input type="text" placeholder="Funding Amount Needed" className="w-full bg-[#1B263B] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#00F5D4]" onChange={e => updateBizInput('funding', e.target.value)} />
                                          <textarea placeholder="Business Description & Traction..." className="w-full bg-[#1B263B] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#00F5D4] h-32" onChange={e => updateBizInput('description', e.target.value)} />
                                          <input type="text" placeholder="Industry" className="w-full bg-[#1B263B] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#00F5D4]" onChange={e => updateBizInput('industry', e.target.value)} />
                                      </>
                                  )}
                                  {bizTool === 'brand' && (
                                      <>
                                          <input type="text" placeholder="Industry" className="w-full bg-[#1B263B] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#00F5D4]" onChange={e => updateBizInput('industry', e.target.value)} />
                                          <input type="text" placeholder="Preferred Name (Optional)" className="w-full bg-[#1B263B] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#00F5D4]" onChange={e => updateBizInput('name', e.target.value)} />
                                          <input type="text" placeholder="Vibe (e.g. Modern, Luxury, Fun)" className="w-full bg-[#1B263B] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#00F5D4]" onChange={e => updateBizInput('vibe', e.target.value)} />
                                      </>
                                  )}
                                  {bizTool === 'profit' && (
                                      <>
                                          <input type="text" placeholder="Business Type (Product/Service)" className="w-full bg-[#1B263B] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#00F5D4]" onChange={e => updateBizInput('type', e.target.value)} />
                                          <input type="number" placeholder="Monthly Fixed Costs ($)" className="w-full bg-[#1B263B] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#00F5D4]" onChange={e => updateBizInput('fixedCost', e.target.value)} />
                                          <input type="number" placeholder="Variable Cost Per Unit ($)" className="w-full bg-[#1B263B] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#00F5D4]" onChange={e => updateBizInput('varCost', e.target.value)} />
                                          <input type="number" placeholder="Sale Price Per Unit ($)" className="w-full bg-[#1B263B] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#00F5D4]" onChange={e => updateBizInput('price', e.target.value)} />
                                      </>
                                  )}
                                  {bizTool === 'legal' && (
                                      <>
                                          <select className="w-full bg-[#1B263B] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#00F5D4]" onChange={e => updateBizInput('docType', e.target.value)}>
                                              <option value="NDA">Non-Disclosure Agreement (NDA)</option>
                                              <option value="Contract">Service Contract</option>
                                              <option value="Terms">Terms & Conditions</option>
                                              <option value="Privacy">Privacy Policy</option>
                                          </select>
                                          <input type="text" placeholder="Party A Name (You)" className="w-full bg-[#1B263B] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#00F5D4]" onChange={e => updateBizInput('partyA', e.target.value)} />
                                          <input type="text" placeholder="Party B Name (Other)" className="w-full bg-[#1B263B] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#00F5D4]" onChange={e => updateBizInput('partyB', e.target.value)} />
                                          <textarea placeholder="Key Terms / Specific Clauses..." className="w-full bg-[#1B263B] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#00F5D4] h-32" onChange={e => updateBizInput('terms', e.target.value)} />
                                      </>
                                  )}
                                  {bizTool === 'hr' && (
                                      <>
                                          <input type="text" placeholder="Job Role Title" className="w-full bg-[#1B263B] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#00F5D4]" onChange={e => updateBizInput('role', e.target.value)} />
                                          <select className="w-full bg-[#1B263B] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#00F5D4]" onChange={e => updateBizInput('level', e.target.value)}>
                                              <option value="Entry">Entry Level</option>
                                              <option value="Mid">Mid-Senior</option>
                                              <option value="Executive">Executive / C-Suite</option>
                                          </select>
                                      </>
                                  )}
                                  
                                  {/* Academy is just content list, no generation */}
                                  {bizTool !== 'academy' && (
                                      <button 
                                          onClick={handleBizGenerate}
                                          disabled={isGenerating}
                                          className="w-full bg-[#00F5D4] hover:bg-[#00F5D4]/80 text-[#0D1B2A] font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(0,245,212,0.3)] flex items-center justify-center gap-2"
                                      >
                                          {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />} Generate
                                      </button>
                                  )}
                              </div>

                              {/* Output Area */}
                              <div className="bg-[#1B263B]/50 border border-white/5 rounded-2xl p-6 min-h-[400px] max-h-[600px] overflow-y-auto custom-scrollbar">
                                  {isGenerating ? (
                                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                          <Loader2 size={48} className="animate-spin text-[#00F5D4] mb-4" />
                                          <p>Consulting Samonya Matrix AI...</p>
                                      </div>
                                  ) : bizResult ? (
                                      bizTool === 'brand' ? (
                                          <div className="space-y-6">
                                              <h3 className="text-[#00F5D4] font-bold text-lg">Identity Kit Generated</h3>
                                              <div className="grid grid-cols-1 gap-4">
                                                  <div className="bg-[#0D1B2A] p-4 rounded-xl border border-white/5">
                                                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Name Ideas</h4>
                                                      <div className="flex flex-wrap gap-2">
                                                          {bizResult.names?.map((n: string) => <span className="bg-white/10 px-3 py-1 rounded-full text-sm">{n}</span>)}
                                                      </div>
                                                  </div>
                                                  <div className="bg-[#0D1B2A] p-4 rounded-xl border border-white/5">
                                                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Color Palette</h4>
                                                      <div className="flex gap-2">
                                                          {bizResult.colors?.map((c: any) => (
                                                              <div key={c.hex} className="text-center">
                                                                  <div className="w-12 h-12 rounded-full mb-1 border border-white/10" style={{backgroundColor: c.hex}}></div>
                                                                  <span className="text-[10px] text-slate-400 block">{c.hex}</span>
                                                              </div>
                                                          ))}
                                                      </div>
                                                  </div>
                                                  <div className="bg-[#0D1B2A] p-4 rounded-xl border border-white/5">
                                                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Logo Style</h4>
                                                      <p className="text-sm text-slate-300 mb-4">{bizResult.logoStyle}</p>
                                                      
                                                      {/* LOGO GENERATOR SECTION */}
                                                      <div className="border-t border-white/5 pt-4">
                                                          {logoImage ? (
                                                              <div className="flex flex-col gap-3 animate-in fade-in">
                                                                  <div className="bg-white/5 rounded-lg p-2 flex items-center justify-center border border-white/10">
                                                                      <img src={logoImage} alt="AI Logo" className="max-h-48 rounded shadow-lg" />
                                                                  </div>
                                                                  <div className="flex gap-2">
                                                                      <button 
                                                                          onClick={handleDownloadLogo}
                                                                          className="flex-1 bg-[#00F5D4]/10 hover:bg-[#00F5D4]/20 text-[#00F5D4] text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                                                      >
                                                                          <Download size={14} /> Download
                                                                      </button>
                                                                      <button 
                                                                          onClick={handleGenerateLogo}
                                                                          className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                                                      >
                                                                          <RefreshCw size={14} /> Regenerate
                                                                      </button>
                                                                  </div>
                                                              </div>
                                                          ) : (
                                                              <button 
                                                                  onClick={handleGenerateLogo}
                                                                  disabled={isGeneratingLogo}
                                                                  className="w-full bg-[#00F5D4] hover:bg-[#00F5D4]/80 text-[#0D1B2A] font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                                              >
                                                                  {isGeneratingLogo ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />} 
                                                                  {isGeneratingLogo ? "Designing Logo..." : "Generate AI Logo"}
                                                              </button>
                                                          )}
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      ) : (
                                          <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                                              {bizResult}
                                          </ReactMarkdown>
                                      )
                                  ) : (
                                      bizTool === 'academy' ? (
                                          <div className="space-y-4">
                                              <h3 className="text-xl font-bold text-white mb-4">Business Academy Modules</h3>
                                              {['Startup Fundamentals 101', 'Digital Marketing Mastery', 'Financial Literacy for CEOs', 'Scaling Operations', 'Leadership Psychology'].map((lesson, i) => (
                                                  <div key={i} className="flex items-center justify-between p-4 bg-[#0D1B2A] rounded-xl border border-white/5 hover:border-[#00F5D4]/50 cursor-pointer group transition-all">
                                                      <div className="flex items-center gap-4">
                                                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#00F5D4] group-hover:bg-[#00F5D4] group-hover:text-[#0D1B2A] transition-colors">{i+1}</div>
                                                          <div>
                                                              <h4 className="font-bold text-white group-hover:text-[#00F5D4] transition-colors">{lesson}</h4>
                                                              <p className="text-xs text-slate-500">25 min • Video & Article</p>
                                                          </div>
                                                      </div>
                                                      <Play size={20} className="text-slate-500 group-hover:text-white" />
                                                  </div>
                                              ))}
                                          </div>
                                      ) : (
                                          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center">
                                              <Briefcase size={48} className="mb-4 opacity-20" />
                                              <p>Output will appear here.</p>
                                          </div>
                                      )
                                  )}
                              </div>
                          </div>
                      </div>
                  )}

                  {/* Business Pricing Tiers (Visible on Dashboard Only) */}
                  {bizTool === 'dashboard' && (
                      <div className="mt-16 pt-10 border-t border-white/5">
                          <h3 className="text-xl font-bold text-white mb-6 text-center">Upgrade Business Matrix</h3>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              {[
                                  { name: "Explorer", price: "Free", features: ["Basic Dashboard", "Academy Access"], highlight: false },
                                  { name: "Entrepreneur", price: "$4.99/mo", features: ["AI Business Builder", "Capital Finder"], highlight: true },
                                  { name: "Enterprise", price: "$19.99/mo", features: ["Legal Assistant", "HR Manager", "Priority Support"], highlight: false },
                                  { name: "Titan Suite", price: "$99.99/yr", features: ["All Features", "Unlimited Generations", "1-on-1 Consulting"], highlight: true, color: "border-[#00F5D4]" }
                              ].map(plan => (
                                  <div key={plan.name} className={`bg-[#1B263B] p-6 rounded-xl border ${plan.color || 'border-white/5'} flex flex-col items-center text-center relative overflow-hidden group`}>
                                      {plan.highlight && <div className="absolute top-0 inset-x-0 h-1 bg-[#00F5D4]"></div>}
                                      <h4 className="font-bold text-white mb-2">{plan.name}</h4>
                                      <div className="text-2xl font-black text-[#00F5D4] mb-4">{plan.price}</div>
                                      <ul className="text-xs text-slate-400 space-y-2 mb-6 flex-1">
                                          {plan.features.map(f => <li key={f}>{f}</li>)}
                                      </ul>
                                      <button className="w-full py-2 rounded-lg bg-white/5 hover:bg-[#00F5D4] hover:text-[#0D1B2A] transition-all text-sm font-bold border border-white/10">Select</button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  // 1. SAMONYA ACADEMY RENDERER
  if (isAcademy) {
      // ... (Academy Code remains mostly same)
      const academyTools = [
          { id: 'quick', name: "Quick Answer", icon: Zap, desc: "Direct, fast summaries.", color: "text-cyan-400" },
          { id: 'deep', name: "Deep Research", icon: Brain, desc: "Comprehensive academic analysis.", color: "text-amber-400" },
          { id: 'math', name: "Math Solver", icon: Calculator, desc: "Expert math tutor solutions.", color: "text-cyan-400" },
          { id: 'agent', name: "Polymath Agent", icon: Users, desc: "Collaborative agent.", color: "text-pink-400" },
          { id: 'study', name: "Study Companion", icon: Layers, desc: "Quizzes and flashcards.", color: "text-green-400" },
          { id: 'book', name: "Book Condenser", icon: BookOpen, desc: "Key takeaways.", color: "text-blue-400" },
          { id: 'brand', name: "Brand Pulse", icon: BarChart, desc: "Brand visibility.", color: "text-purple-400" },
          { id: 'invite', name: "Invite Crafter", icon: Mail, desc: "AI invitations.", color: "text-yellow-400" },
          { id: 'charisma', name: "Charisma Coach", icon: Smile, desc: "Social skills.", color: "text-red-400" },
          { id: 'sleep', name: "Sleep Professor", icon: Bed, desc: "Boring lectures.", color: "text-indigo-300" }
      ];

      return (
        <div className="min-h-screen bg-gray-900 text-white font-serif flex flex-col">
           {/* Academy Header */}
           <div className="py-6 px-8 border-b border-gray-700 bg-gray-900/90 backdrop-blur-md sticky top-16 z-30 flex justify-between items-center">
               <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setAcademyMode(''); setAcademyHistory([]); }}>
                   <div className="p-3 bg-amber-500/20 rounded-full border border-amber-500/50">
                       <GraduationCap className="text-amber-400" size={32} />
                   </div>
                   <div>
                       <h1 className="text-2xl font-bold text-white tracking-wide">SAMONYA ACADEMY</h1>
                   </div>
               </div>

               {academyMode && (
                   <button 
                    onClick={() => { setAcademyMode(''); setAcademyHistory([]); }}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 flex items-center gap-2 border border-white/10"
                   >
                       <ArrowLeft size={16} /> Dashboard
                   </button>
               )}
           </div>

           {/* Content Area */}
           <div className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8 overflow-y-auto pb-32">
               {!academyMode && (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                       {academyTools.map(tool => (
                           <button 
                            key={tool.id}
                            onClick={() => setAcademyMode(tool.id)}
                            className="bg-gray-800 hover:bg-gray-700 border border-white/5 hover:border-amber-500/30 p-6 rounded-2xl text-left transition-all group shadow-xl hover:-translate-y-1"
                           >
                               <div className={`w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center mb-4 ${tool.color}`}>
                                   <tool.icon size={24} />
                               </div>
                               <h3 className="font-bold text-xl text-white mb-2 font-sans">{tool.name}</h3>
                               <p className="text-sm text-gray-400 font-sans line-clamp-2">{tool.desc}</p>
                           </button>
                       ))}
                   </div>
               )}

               {/* Active Tool Chat */}
               {academyMode && (
                   <div className={`flex flex-col lg:flex-row gap-6 ${academyMode === 'math' ? 'h-[75vh]' : 'h-auto'}`}>
                       <div className={`flex-1 flex flex-col ${academyMode === 'math' ? 'lg:w-2/3 h-full bg-gray-800/20 rounded-2xl border border-white/5' : ''}`}>
                           <div className="flex-1">
                               {academyHistory.map((msg, idx) => (
                                   <div key={idx} className={`flex gap-6 mb-6 ${msg.type === 'user' ? 'justify-end' : ''}`}>
                                       <div className={`max-w-[85%] ${msg.type === 'user' ? 'bg-gray-800 px-6 py-4 rounded-2xl' : ''}`}>
                                            <ReactMarkdown className="prose prose-invert">{msg.text}</ReactMarkdown>
                                       </div>
                                   </div>
                               ))}
                               <div ref={academyScrollRef}></div>
                           </div>
                       </div>
                       
                       {/* Math Calculator Sidebar */}
                       {academyMode === 'math' && (
                           <div className="lg:w-1/3 bg-gray-800 rounded-2xl border border-white/5 p-4 flex flex-col shadow-2xl h-full">
                               <div className="bg-black/40 rounded-xl p-4 mb-4 text-right border border-white/10 h-24 flex flex-col justify-end">
                                   <div className="text-xs text-gray-500 mb-1 h-4">{calcResult}</div>
                                   <div className="text-3xl text-white font-mono tracking-widest overflow-x-auto no-scrollbar whitespace-nowrap">
                                       {calcInput || '0'}
                                   </div>
                               </div>
                               <div className="grid grid-cols-4 gap-2 flex-1">
                                   {[
                                       ['C', 'bg-red-900/50 text-red-200'], ['(', 'bg-gray-700'], [')', 'bg-gray-700'], ['/', 'bg-cyan-900/50 text-cyan-200'],
                                       ['7', 'bg-gray-700'], ['8', 'bg-gray-700'], ['9', 'bg-gray-700'], ['*', 'bg-cyan-900/50 text-cyan-200'],
                                       ['4', 'bg-gray-700'], ['5', 'bg-gray-700'], ['6', 'bg-gray-700'], ['-', 'bg-cyan-900/50 text-cyan-200'],
                                       ['1', 'bg-gray-700'], ['2', 'bg-gray-700'], ['3', 'bg-gray-700'], ['+', 'bg-cyan-900/50 text-cyan-200'],
                                       ['0', 'bg-gray-700 col-span-2'], ['.', 'bg-gray-700'], ['=', 'bg-green-600 text-white'],
                                       ['sin', 'bg-gray-900 text-xs'], ['cos', 'bg-gray-900 text-xs'], ['tan', 'bg-gray-900 text-xs'], ['DEL', 'bg-red-900/50 text-xs text-red-200'],
                                   ].map(([label, cls]) => (
                                       <button key={label} onClick={() => handleCalcPress(label)} className={`rounded-lg font-bold text-lg ${cls}`}>
                                           {label === 'DEL' ? <Delete size={18} /> : label}
                                       </button>
                                   ))}
                               </div>
                           </div>
                       )}
                   </div>
               )}
           </div>

           {/* Input Area */}
           {academyMode && (
               <div className="fixed bottom-0 left-0 right-0 p-6 bg-gray-900 border-t border-gray-800 z-40">
                   <div className="max-w-4xl mx-auto relative flex gap-2">
                       <input 
                        type="text" 
                        value={academyInput}
                        onChange={(e) => setAcademyInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAcademySearch(academyInput)}
                        placeholder="Enter your query..."
                        className="flex-1 bg-gray-800 border-none outline-none text-white px-4 py-3 text-lg font-sans rounded-xl"
                       />
                       <button onClick={() => handleAcademySearch(academyInput)} disabled={isGenerating} className="p-3 bg-amber-600 rounded-xl text-white">
                           {isGenerating ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                       </button>
                   </div>
               </div>
           )}
        </div>
      );
  }

  // 1. SAMONYA AI (VERSION 6) REDESIGN
  if (isSamonyaAI) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
            
            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden border-b border-cyan-500/10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-6 animate-in fade-in slide-in-from-bottom-4">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> Version 6.0 Online
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
                        SAMONYA AI <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">INTELLIGENCE REIMAGINED</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Your smarter way to think, create, and solve. Always learning. Always ready.
                    </p>
                    <button 
                        onClick={() => switchAiMode('chat')}
                        className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-cyan-50 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] flex items-center gap-2 mx-auto animate-in zoom-in duration-500 delay-200"
                    >
                        <MessageSquare size={20} /> Talk to Samonya AI
                    </button>
                </div>
            </section>

            {/* FEATURES GRID */}
            <section className="py-20 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">What Samonya AI Does</h2>
                    <p className="text-slate-400">A complete suite of cognitive tools. Select a module to activate.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div onClick={() => switchAiMode('chat')} className="bg-slate-900/50 p-8 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group hover:-translate-y-1 cursor-pointer">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
                            <MessageSquare size={24} />
                        </div>
                        <h3 className="font-bold text-lg text-white mb-2">Natural Chat</h3>
                        <p className="text-slate-400 text-sm">Human-like conversation with deep context awareness.</p>
                    </div>
                    <div onClick={() => switchAiMode('code')} className="bg-slate-900/50 p-8 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group hover:-translate-y-1 cursor-pointer">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
                            <Code2 size={24} />
                        </div>
                        <h3 className="font-bold text-lg text-white mb-2">Advanced Coding</h3>
                        <p className="text-slate-400 text-sm">Generate, debug, and optimize complex databases and code.</p>
                    </div>
                    <div onClick={() => switchAiMode('strategy')} className="bg-slate-900/50 p-8 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group hover:-translate-y-1 cursor-pointer">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
                            <Brain size={24} />
                        </div>
                        <h3 className="font-bold text-lg text-white mb-2">Strategic Analysis</h3>
                        <p className="text-slate-400 text-sm">Break down problems and formulate actionable plans.</p>
                    </div>
                </div>
            </section>

            {/* CHAT INTERFACE */}
            <section id="chat-interface" className="py-10 px-4 bg-slate-900 border-y border-white/5">
                <div className="max-w-5xl mx-auto h-[80vh] flex flex-col bg-slate-950 rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-white/10 bg-slate-900/80 backdrop-blur flex justify-between items-center z-10">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br ${aiMode === 'code' ? 'from-purple-500 to-indigo-600' : aiMode === 'strategy' ? 'from-amber-500 to-orange-600' : 'from-cyan-500 to-blue-600'}`}>
                                {aiMode === 'code' ? <Code2 className="text-white" size={20} /> : aiMode === 'strategy' ? <Brain className="text-white" size={20} /> : <Bot className="text-white" size={20} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-white uppercase tracking-wider text-sm">
                                    {aiMode === 'code' ? 'Advanced Coding' : aiMode === 'strategy' ? 'Strategic Analysis' : 'Samonya AI Chat'}
                                </h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-xs text-slate-400 font-mono">SYSTEM READY</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => switchAiMode(aiMode)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white" title="Reset Chat">
                            <RefreshCw size={18} />
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
                        {aiMessages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender === 'ai' && (
                                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                                        <Bot size={14} className="text-cyan-400" />
                                    </div>
                                )}
                                <div className={`max-w-[85%] p-4 rounded-2xl shadow-lg ${
                                    msg.sender === 'user' 
                                        ? 'bg-cyan-600 text-white rounded-br-none' 
                                        : 'bg-slate-900 border border-white/10 text-slate-300 rounded-bl-none'
                                }`}>
                                    {msg.imageUrl && (
                                        <img src={msg.imageUrl} alt="Generated Visual" className="max-w-full h-auto rounded-lg mb-3 border border-white/10" />
                                    )}
                                    <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {isGenerating && (
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                                    <Bot size={14} className="text-cyan-400" />
                                </div>
                                <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl rounded-bl-none flex items-center gap-3">
                                    <Loader2 size={16} className="text-cyan-400 animate-spin" />
                                    <span className="text-xs text-slate-500 font-mono animate-pulse">THINKING...</span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef}></div>
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-slate-900 border-t border-white/10 z-10">
                        <div className="relative flex gap-2 items-end bg-slate-950 border border-white/10 rounded-2xl p-2 focus-within:border-cyan-500/50 transition-colors">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                            >
                                <Paperclip size={20} />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                            
                            <textarea
                                ref={aiInputRef}
                                value={aiInput}
                                onChange={handleAiInputResize}
                                onKeyDown={handleAiKeyDown}
                                placeholder={`Message ${aiMode === 'chat' ? 'Samonya AI' : aiMode}...`}
                                className="flex-1 bg-transparent border-none outline-none text-white max-h-32 py-3 px-2 resize-none custom-scrollbar placeholder:text-slate-600"
                                rows={1}
                            />
                            
                            <button 
                                onClick={() => handleAiSend()}
                                disabled={(!aiInput.trim() && !selectedImage) || isGenerating}
                                className={`p-3 rounded-xl transition-all ${
                                    (!aiInput.trim() && !selectedImage) || isGenerating 
                                        ? 'bg-white/5 text-slate-600 cursor-not-allowed' 
                                        : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-900/20'
                                }`}
                            >
                                {isGenerating ? <StopCircle size={20} /> : <Send size={20} />}
                            </button>
                        </div>
                        {imagePreview && (
                            <div className="absolute bottom-20 left-6 bg-slate-900 p-2 rounded-xl border border-white/10 shadow-xl flex items-start gap-2 animate-in slide-in-from-bottom-2">
                                <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                                <button onClick={clearSelectedImage} className="bg-red-500/20 text-red-400 p-1 rounded-full hover:bg-red-500 hover:text-white"><X size={12}/></button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

        </div>
      );
  }

  // 2. DREAM EYE RENDERER - SIGNIFICANT UPGRADE
  if (isDreamEye) {
      return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-fuchsia-500 selection:text-white">
            <div className="relative py-16 px-4 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fuchsia-900/20 via-[#050505] to-[#050505]"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent opacity-50"></div>
                
                <div className="relative z-10 max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="flex justify-center mb-6 animate-float">
                            <DreamEyeLogo size={140} />
                        </div>
                        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-fuchsia-300 via-cyan-300 to-white mb-4 tracking-tighter drop-shadow-[0_0_30px_rgba(217,70,239,0.3)]">
                            SAMONYA DREAM EYE
                        </h1>
                        <div className="flex justify-center items-center gap-3 text-fuchsia-400/80 text-sm font-bold tracking-[0.2em] uppercase">
                            <span className="w-2 h-2 bg-fuchsia-500 rounded-full animate-pulse"></span>
                            System Online
                            <span className="w-2 h-2 bg-fuchsia-500 rounded-full animate-pulse"></span>
                        </div>
                        <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                            Advanced subconscious decoding. Uncover the psychological, spiritual, and emotional architecture of your dreams.
                        </p>
                    </div>

                    {/* Input Section */}
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-1 shadow-2xl mb-12 relative group">
                         <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-cyan-600 rounded-3xl opacity-20 group-hover:opacity-40 transition-opacity blur"></div>
                         <div className="relative bg-[#0a0a0a] rounded-[22px] p-6 md:p-8">
                            <textarea 
                                value={dreamInput}
                                onChange={(e) => setDreamInput(e.target.value)}
                                placeholder="Tell me your dream..."
                                className="w-full bg-transparent border-none text-lg text-white placeholder-slate-600 focus:outline-none h-32 resize-none custom-scrollbar"
                            />
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                                    Samonya Dream Decoder
                                </span>
                                <button 
                                    onClick={handleAnalyzeDream}
                                    disabled={!dreamInput.trim() || isGenerating}
                                    className="px-8 py-3 bg-white text-black hover:bg-fuchsia-50 font-bold rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Eye size={18} />} 
                                    {isGenerating ? 'Decoding...' : 'Analyze Dream'}
                                </button>
                            </div>
                         </div>
                    </div>

                    {/* Results Display */}
                    {dreamResult && (
                        <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 space-y-8">
                            
                            {/* 1. Summary & Archetype Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 bg-[#0f0f11] border border-white/10 rounded-2xl p-8 shadow-lg">
                                    <h3 className="text-fuchsia-400 font-bold uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                                        <Moon size={14}/> Dream Summary
                                    </h3>
                                    <p className="text-xl text-white font-serif leading-relaxed italic">
                                        "{dreamResult.summary}"
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-fuchsia-900/40 to-cyan-900/40 border border-fuchsia-500/30 rounded-2xl p-8 flex flex-col justify-center text-center shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-20"><Compass size={64} /></div>
                                    <h3 className="text-white/60 font-bold uppercase text-xs tracking-widest mb-2">Primary Archetype</h3>
                                    <div className="text-2xl font-black text-white mb-2">{dreamResult.archetype}</div>
                                    <p className="text-xs text-fuchsia-200 leading-relaxed">{dreamResult.archetypeReason}</p>
                                </div>
                            </div>

                            {/* 2. Emotional Spectrum & Symbols */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Emotional Analysis */}
                                <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8">
                                    <h3 className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
                                        <Activity size={14}/> Emotional Resonance
                                    </h3>
                                    <div className="space-y-4">
                                        {Object.entries(dreamResult.emotions).map(([key, val]) => (
                                            <div key={key} className="flex items-center gap-4">
                                                <div className="w-24 text-sm font-bold capitalize text-slate-300">{key}</div>
                                                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-1000 ${
                                                            key === 'fear' ? 'bg-red-500' : 
                                                            key === 'hope' ? 'bg-green-400' :
                                                            key === 'intuition' ? 'bg-purple-500' :
                                                            key === 'stress' ? 'bg-orange-400' : 'bg-blue-400'
                                                        }`}
                                                        style={{ width: `${val}%` }}
                                                    ></div>
                                                </div>
                                                <div className="w-8 text-right text-xs text-slate-500">{val}%</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Symbolic Breakdown */}
                                <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8">
                                    <h3 className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
                                        <Fingerprint size={14}/> Symbolic Keys
                                    </h3>
                                    <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                                        {dreamResult.symbols.map((sym, i) => (
                                            <div key={i} className="pb-4 border-b border-white/5 last:border-0 last:pb-0">
                                                <div className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full"></span> {sym.name}
                                                </div>
                                                <p className="text-slate-400 text-xs leading-relaxed pl-3.5 border-l border-white/5">
                                                    {sym.meaning}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 3. Deep Analysis & Visualization */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8">
                                        <h3 className="text-cyan-400 font-bold uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                                            <Brain size={14}/> Subconscious Truth
                                        </h3>
                                        <p className="text-slate-300 text-sm leading-relaxed">{dreamResult.subconsciousMeaning}</p>
                                    </div>
                                    <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8">
                                        <h3 className="text-green-400 font-bold uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                                            <Anchor size={14}/> Life Application
                                        </h3>
                                        <p className="text-slate-300 text-sm leading-relaxed">{dreamResult.lifeApplication}</p>
                                    </div>
                                    {dreamResult.futureInsight && (
                                        <div className="bg-gradient-to-r from-fuchsia-900/20 to-cyan-900/20 border border-fuchsia-500/20 rounded-2xl p-8">
                                            <h3 className="text-amber-300 font-bold uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                                                <Sparkles size={14}/> Future Pathways
                                            </h3>
                                            <p className="text-fuchsia-100 text-sm leading-relaxed">{dreamResult.futureInsight}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Visual Generator Card */}
                                <div className="bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group h-full min-h-[400px]">
                                     <img 
                                        src={`https://image.pollinations.ai/prompt/${encodeURIComponent(dreamResult.visualPrompt + " cosmic surreal dreamscape 8k masterpiece")}&width=800&height=1000&nologo=true`}
                                        alt="Dream Visual"
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 scale-100 group-hover:scale-105"
                                        crossOrigin="anonymous"
                                     />
                                     <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                                     
                                     <div className="absolute bottom-0 left-0 right-0 p-8">
                                         <h3 className="text-white font-bold text-lg mb-2 drop-shadow-md">Visual Reconstruction</h3>
                                         <p className="text-xs text-slate-300 mb-6 line-clamp-3 opacity-80 font-serif italic">
                                             "{dreamResult.dreamUniverseVisual}"
                                         </p>
                                         <button 
                                            onClick={handleDownloadDream}
                                            disabled={isDownloadingDream}
                                            className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                                         >
                                             {isDownloadingDream ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                                             Save to Gallery
                                         </button>
                                     </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
      );
  }

  // 3. MOTIVATION HUB RENDERER
  if (isMotivation) {
      // (Reused existing code for Motivation)
      return (
        <div className="min-h-screen bg-slate-900 text-white pb-20">
            <div className="bg-gradient-to-b from-amber-500/20 to-slate-900 py-16 px-4 text-center">
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500 mb-6 shadow-lg shadow-amber-500/40">
                     <Lightbulb size={32} className="text-white" />
                 </div>
                 <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">SAMONYA MOTIVATION</h1>
                 <p className="text-amber-200/80 text-xl max-w-2xl mx-auto">Ignite your inner fire. What do you need strength for today?</p>
            </div>
            <div className="max-w-4xl mx-auto px-4 -mt-8">
                 <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-amber-500/30">
                     <div className="flex flex-col md:flex-row gap-4 mb-6">
                         <input 
                            type="text" 
                            value={genTopic}
                            onChange={(e) => setGenTopic(e.target.value)}
                            placeholder="I need motivation for..."
                            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-6 py-4 text-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                         />
                         <button 
                            onClick={() => handleGenerateQuote(genTopic)}
                            disabled={isGenerating || !genTopic.trim()}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                         >
                            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />} Inspire Me
                         </button>
                     </div>
                     <div className="flex flex-wrap gap-2 justify-center">
                        {motivationTags.map(tag => (
                            <button key={tag} onClick={() => handleGenerateQuote(tag)} className="px-4 py-2 rounded-full bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 border border-white/5 transition-all text-sm font-medium text-slate-400">{tag}</button>
                        ))}
                     </div>
                 </div>
                 {generatedQuote && (
                     <div className="mt-12 relative animate-in zoom-in duration-500">
                         <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full opacity-20"></div>
                         <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 p-10 md:p-16 rounded-2xl text-center shadow-2xl">
                             <Quote className="text-cyan-400 w-12 h-12 mx-auto mb-6 opacity-50" />
                             <h2 className="text-2xl md:text-4xl font-serif font-medium leading-relaxed text-white mb-8">"{generatedQuote.quote}"</h2>
                             <div className="w-16 h-1 bg-cyan-500 mx-auto mb-6"></div>
                             <p className="text-slate-400 uppercase tracking-widest font-bold text-sm">{generatedQuote.author}</p>
                             <div className="mt-8 flex justify-center gap-4">
                                 <button onClick={() => copyToClipboard(generatedQuote.quote)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"><Copy size={20} /></button>
                                 <button onClick={handleDownloadQuote} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"><Download size={20} /></button>
                             </div>
                         </div>
                     </div>
                 )}
            </div>
        </div>
      );
  }

  // 4. STANDARD BRAND PAGE (Default)
  return (
    <div className={`min-h-screen ${brand.themeColor} ${brand.textColor}`}>
      <div className={`relative py-20 px-4 overflow-hidden border-b border-white/10`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${brand.gradient} opacity-20`}></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-8">
           <div className={`w-32 h-32 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl ${brand.color} border-4 border-white/10`}>
              <Icon size={64} />
           </div>
           <div className="text-center md:text-left">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-2">{brand.name}</h1>
              <p className="text-xl md:text-2xl font-light opacity-90 max-w-2xl">{brand.description}</p>
              <div className="flex flex-wrap gap-4 mt-8 justify-center md:justify-start">
                  
                  {/* Common Feature: Article */}
                  <button onClick={() => setShowArticleModal(true)} className="flex items-center gap-2 bg-black/30 text-white border border-white/30 px-6 py-3 rounded-full font-bold hover:bg-black/50 transition-colors backdrop-blur-sm">
                     <FileText size={20} /> Generate Article
                  </button>

                  {/* Milele Specific: Lyrics Studio & Scripture */}
                  {brand.id === BrandId.MILELE && (
                      <>
                        <button onClick={() => setShowMusicModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg border border-white/10">
                           <Mic2 size={20} /> AI Song & Lyrics Writer
                        </button>
                        <button onClick={() => setShowScriptureModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg border border-white/10">
                           <BookOpen size={20} /> Daily Power Scripture
                        </button>
                      </>
                  )}
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
             
             {/* Article Card - Standard */}
             <div onClick={() => setShowArticleModal(true)} className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-600/30 transition-all group h-full min-h-[200px]">
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/40"><FileText className="text-white" size={32} /></div>
                <h3 className="font-bold text-xl mb-1">Write AI Article</h3>
                <p className="text-sm opacity-70">Generate deep-dive articles with auto-visuals.</p>
             </div>

             {/* Milele Specific: Lyrics Card */}
             {brand.id === BrandId.MILELE && (
                <>
                    <div onClick={() => setShowMusicModal(true)} className="bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-600/30 transition-all group h-full min-h-[200px]">
                        <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/40"><Mic2 className="text-white" size={32} /></div>
                        <h3 className="font-bold text-xl mb-1">Lyrics & Style Studio</h3>
                        <p className="text-sm opacity-70">Write full songs with custom genre, mood, and style guides.</p>
                    </div>
                    
                    {/* Scripture Card */}
                    <div onClick={() => setShowScriptureModal(true)} className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-amber-600/30 transition-all group h-full min-h-[200px]">
                        <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/40"><BookOpen className="text-white" size={32} /></div>
                        <h3 className="font-bold text-xl mb-1">Power Scripture</h3>
                        <p className="text-sm opacity-70">Auto-generate daily scriptures with powerful insights.</p>
                    </div>
                </>
             )}
         </div>

         <div className="flex gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
            {['All', 'Article', 'Music', 'Lyrics'].map(type => (
                <button key={type} onClick={() => setActiveTab(type)} className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${activeTab === type ? 'bg-white text-black' : 'bg-black/20 text-white hover:bg-black/40 border border-white/10'}`}>
                    {type}
                </button>
            ))}
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brandContent.map(item => (
                <ContentCard key={item.id} item={item} />
            ))}
         </div>
         {brandContent.length === 0 && (
             <div className="text-center py-20 opacity-50"><p>No content available for this filter yet.</p></div>
         )}
      </div>

      <PricingSection isLight={isLight} />

      {/* MODALS */}
      {showMusicModal && <MusicGenerator brandId={brand.id} onClose={() => setShowMusicModal(false)} />}
      {showImageModal && <ImageGenerator onClose={() => setShowImageModal(false)} />}
      {showArticleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                  <button onClick={() => setShowArticleModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><FileText className="text-blue-400"/> New Article</h3>
                  <p className="text-slate-400 text-sm mb-6">Enter a topic, and Samonya AI will write a full article with visuals.</p>
                  <input type="text" placeholder="Topic (e.g., The Future of Mars)" value={articleTopic} onChange={e => setArticleTopic(e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none mb-6" autoFocus />
                  <button onClick={handleGenerateArticle} disabled={!articleTopic.trim() || isGenerating} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50">
                      {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />} Generate
                  </button>
              </div>
          </div>
      )}

      {/* Scripture Modal */}
      {showScriptureModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in zoom-in duration-300">
              <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                  {/* Decorative Background */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-900/40 via-slate-900 to-slate-900"></div>
                  
                  <div className="relative p-8 flex flex-col items-center text-center">
                      <button onClick={() => setShowScriptureModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-black/20 p-2 rounded-full"><X size={20} /></button>
                      
                      {!scriptureResult ? (
                          <>
                              <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-6 border border-amber-500/50 shadow-lg shadow-amber-500/20">
                                  <BookOpen size={40} className="text-amber-400" />
                              </div>
                              <h3 className="text-2xl font-serif font-bold text-white mb-2">Daily Power Scripture</h3>
                              <p className="text-slate-400 mb-8 max-w-xs">Seek wisdom from the ancient texts. What guidance do you need today?</p>
                              
                              <input 
                                type="text" 
                                value={scriptureTopic}
                                onChange={e => setScriptureTopic(e.target.value)}
                                placeholder="e.g. Strength, Peace, Finances..."
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none mb-6 text-center placeholder-slate-600"
                              />
                              
                              <button 
                                onClick={handleGenerateScripture}
                                disabled={isGenerating}
                                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                              >
                                  {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />} Reveal Scripture
                              </button>
                          </>
                      ) : (
                          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
                              <div className="mb-6">
                                  <div className="text-amber-500 text-4xl font-serif mb-2">“</div>
                                  <p className="text-xl md:text-2xl font-serif text-white leading-relaxed italic min-h-[100px]">
                                      {displayedScripture}
                                      <span className="animate-pulse">|</span>
                                  </p>
                                  <div className="text-amber-500 text-4xl font-serif mt-2 text-right">”</div>
                              </div>
                              
                              <div className="w-16 h-1 bg-amber-600 mx-auto mb-6 rounded-full"></div>
                              
                              <h4 className="text-lg font-bold text-amber-400 uppercase tracking-widest mb-6">
                                  {scriptureResult.reference}
                              </h4>
                              
                              <div className="bg-white/5 p-4 rounded-xl border border-white/5 mb-8">
                                  <p className="text-sm text-slate-300 leading-relaxed">
                                      <span className="font-bold text-amber-500 block mb-1 uppercase text-xs tracking-wide">Power Insight</span>
                                      {scriptureResult.insight}
                                  </p>
                              </div>
                              
                              <button 
                                onClick={() => { setScriptureResult(null); setDisplayedScripture(''); }}
                                className="text-slate-400 hover:text-white text-sm underline decoration-slate-600 underline-offset-4"
                              >
                                  Get Another Verse
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default BrandPage;
