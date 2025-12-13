
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from '../context/AppContext';
import { useApp } from '../context/AppContext';
import { generateLongFormArticle, translateText } from '../services/geminiService';
import { ArrowLeft, Clock, Calendar, Loader2, Download, Rocket, Video, FileText, Image as ImageIcon, ChevronDown, Languages, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const ArticleView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { content } = useApp();
  const [articleBody, setArticleBody] = useState<string>('');
  const [originalArticleBody, setOriginalArticleBody] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [currentLang, setCurrentLang] = useState('English');
  const articleRef = useRef<HTMLDivElement>(null);

  const item = content ? content.find(c => c.id === id) : undefined;

  const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'sw', name: 'Swahili' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ar', name: 'Arabic' },
  ];

  useEffect(() => {
    const fetchContent = async () => {
        if (!item) return;
        setIsLoading(true);
        try {
            const generatedText = await generateLongFormArticle(item.title, item.brandId);
            
            // Failsafe: Ensure visual exists at the top
            let finalText = generatedText || "";
            if (!finalText.includes('[VISUAL:') && finalText.length > 0) {
                 // Inject a header visual if the AI missed it
                 finalText = `[VISUAL: ${item.title} cinematic 4k scene]\n\n` + finalText;
            }
            
            setArticleBody(finalText || "No content generated.");
            setOriginalArticleBody(finalText || "No content generated.");
        } catch (e) {
            setArticleBody("Failed to load article content.");
        } finally {
            setIsLoading(false);
        }
    };

    fetchContent();
  }, [item]);

  const handleTranslate = async (langName: string) => {
      setShowLangMenu(false);
      if (langName === currentLang) return;
      
      if (langName === 'English') {
          setArticleBody(originalArticleBody);
          setCurrentLang('English');
          return;
      }

      setIsTranslating(true);
      try {
          const translated = await translateText(originalArticleBody, langName);
          if (translated) {
              setArticleBody(translated);
              setCurrentLang(langName);
          } else {
              alert("Translation unavailable at the moment.");
          }
      } catch (e) {
          console.error(e);
          alert("Translation failed.");
      } finally {
          setIsTranslating(false);
      }
  };

  const handleDownloadPDF = async () => {
      setShowExportMenu(false);
      if (!articleRef.current || isExporting) return;
      
      setIsExporting(true);

      try {
          // 1. Create a clone for rendering the PDF layout (White bg, black text, watermark)
          const element = articleRef.current.querySelector('.print-content') as HTMLElement;
          if (!element) throw new Error("Content not found");

          const clone = element.cloneNode(true) as HTMLElement;
          
          // 2. Style the clone for PDF output
          clone.style.width = '794px'; // A4 width approx at 96 DPI
          clone.style.padding = '40px';
          clone.style.backgroundColor = 'white';
          clone.style.color = 'black';
          clone.style.position = 'fixed';
          clone.style.top = '-10000px';
          clone.style.left = '0';
          clone.style.zIndex = '1000';
          clone.style.backgroundImage = `url('data:image/svg+xml;charset=utf-8,${watermarkSvg}')`;
          clone.style.backgroundRepeat = 'repeat';
          clone.style.backgroundSize = '300px 300px';
          clone.style.fontFamily = 'Arial, sans-serif';
          
          // Force text visibility and contrast
          const textElements = clone.querySelectorAll('*');
          textElements.forEach((el: any) => {
              // Reset colors to black for visibility
              if (window.getComputedStyle(el).color !== 'rgb(0, 0, 0)') {
                  el.style.color = 'black';
              }
              // Adjust layout for print
              if (el.tagName === 'IMG') {
                  el.style.maxWidth = '100%';
                  el.style.height = 'auto';
                  el.crossOrigin = 'anonymous';
              }
              // Hide unrelated UI if copied inadvertently
              if (el.classList.contains('no-print')) {
                  el.style.display = 'none';
              }
          });

          // 3. Append to body temporarily
          document.body.appendChild(clone);

          // 4. Capture with html2canvas
          const canvas = await html2canvas(clone, {
              scale: 2, // High resolution
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff'
          });

          // 5. Cleanup
          document.body.removeChild(clone);

          // 6. Generate PDF
          const imgData = canvas.toDataURL('image/jpeg', 0.9);
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = pdfWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          let heightLeft = imgHeight;
          let position = 0;

          // First page
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;

          // Subsequent pages
          while (heightLeft > 0) {
              position = heightLeft - imgHeight; // This calculation for html2canvas pagination is tricky, usually requires better cutting
              // Simplified paging: just standard addImage offset
              pdf.addPage();
              // Reset position for new page relative to the image
              // Actually, multipage html2canvas often duplicates content or cuts lines. 
              // For robustness with this library stack, we simply shift the image up.
              // A better way is creating separate canvases, but for this constraint we stick to simple scrolling.
              pdf.addImage(imgData, 'JPEG', 0, position - 297 * (Math.ceil(imgHeight/297) - Math.ceil(heightLeft/297)) , imgWidth, imgHeight); 
              // The loop logic for basic continuous image PDF:
              // Since we are capturing one giant image, we just slice it.
              // Re-calculating correctly:
              const pageIdx = Math.ceil(imgHeight / pdfHeight) - Math.ceil(heightLeft / pdfHeight);
              pdf.addImage(imgData, 'JPEG', 0, -(pdfHeight * pageIdx), imgWidth, imgHeight);
              
              heightLeft -= pdfHeight;
          }

          pdf.save(`SDU_Article_${item?.title.replace(/[^a-z0-9]/gi, '_').substring(0, 20)}.pdf`);

      } catch (e) {
          console.error("PDF Export failed", e);
          alert("High-fidelity PDF generation failed. Using standard print dialog.");
          window.print();
      } finally {
          setIsExporting(false);
      }
  };

  const handleDownloadTxt = () => {
      setShowExportMenu(false);
      const blob = new Blob([`${item?.title}\n\n${articleBody}`], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SDU_Article_${item?.title.replace(/[^a-z0-9]/gi, '_').substring(0, 20)}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
  };

  const handleGenerateVideo = () => {
      if (!item) return;
      navigate(`/${item.brandId}`);
      alert("Opening Samonya Video Studio... Please click 'Create Video' and paste your article title!");
  };

  const handleDownloadJpg = async () => {
      setShowExportMenu(false);
      if (!item) return;

      try {
          const canvas = document.createElement('canvas');
          canvas.width = 1080;
          canvas.height = 1350; // Portrait poster
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Background
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw Thumbnail
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = item.thumbnail;
          await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve; // Continue even if image fails
          });
          
          // Crop/Fit image to top half
          ctx.drawImage(img, 0, 0, canvas.width, 700);
          
          // Gradient Overlay
          const grad = ctx.createLinearGradient(0, 500, 0, 700);
          grad.addColorStop(0, "transparent");
          grad.addColorStop(1, "#0f172a");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 500, canvas.width, 200);

          // Text Content
          ctx.fillStyle = "white";
          ctx.font = "bold 60px 'Outfit', sans-serif";
          
          // Wrap Title
          const words = item.title.split(' ');
          let line = '';
          let y = 800;
          const lineHeight = 70;
          
          for(let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > 900 && n > 0) {
              ctx.fillText(line, 50, y);
              line = words[n] + ' ';
              y += lineHeight;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, 50, y);

          // Meta
          ctx.font = "30px 'Outfit', sans-serif";
          ctx.fillStyle = "#94a3b8";
          ctx.fillText(`By Samonya AI | ${new Date().toLocaleDateString()}`, 50, y + 60);

          // --- WATERMARK START ---
          const logoSize = 150;
          const x = 50;
          const yLog = 1350 - logoSize - 50;
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

          // Download
          const url = canvas.toDataURL("image/jpeg", 0.9);
          const a = document.createElement('a');
          a.href = url;
          a.download = `SDU_Cover_${item.id}.jpg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

      } catch (e) {
          console.error(e);
          alert("Could not generate image cover.");
      }
  };

  if (!item) return <div className="p-20 text-white text-center">Article not found.</div>;

  const components = {
    p: ({children}: any) => {
        let text = "";
        React.Children.forEach(children, (child) => {
            if (typeof child === 'string') {
                text += child;
            } else if (child && typeof child === 'object' && 'props' in child && typeof child.props.children === 'string') {
                 text += child.props.children;
            }
        });
        
        if (!text && typeof children === 'string') text = children;

        if (text && text.includes('[VISUAL:')) {
            const desc = text.replace('[VISUAL:', '').replace(']', '').trim();
            const encodedDesc = encodeURIComponent(desc + " photorealistic, 4k, high quality");
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedDesc}?width=800&height=400&nologo=true&seed=${Math.floor(Math.random()*1000)}`;

            return (
                <div className="my-8 print:break-inside-avoid">
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-2 shadow-2xl border border-white/10 print:border-gray-300 bg-slate-800">
                        <img 
                            src={imageUrl} 
                            alt={`AI Visual: ${desc}`} 
                            className="w-full h-full object-cover transition-opacity duration-500" 
                            crossOrigin="anonymous"
                            loading="lazy"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-center text-white/80 print:bg-gray-100 print:text-black border-t print:border-gray-300 backdrop-blur-sm">
                            Samonya AI Visual: {desc}
                        </div>
                    </div>
                </div>
            );
        }
        return <p className="mb-4 text-slate-300 leading-relaxed text-lg print:text-black">{children}</p>;
    },
    h2: ({children}: any) => <h2 className="text-2xl font-bold text-pink-400 mt-8 mb-4 print:text-pink-600 page-break-after-avoid">{children}</h2>,
    h3: ({children}: any) => <h3 className="text-xl font-bold text-purple-400 mt-6 mb-3 print:text-purple-600 page-break-after-avoid">{children}</h3>,
  };

  // Create a tiled watermark SVG
  const watermarkSvg = encodeURIComponent(`
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <text x="50%" y="50%" fill="rgba(0,0,0,0.08)" font-weight="900" font-family="Arial, sans-serif" font-size="28" transform="rotate(-45 200 200)" text-anchor="middle" dominant-baseline="middle">
        SAMONYA DIGITAL UNIVERSE
      </text>
    </svg>
  `);

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12 print:bg-white print:pt-0">
        
        <style>{`
            @media print {
                @page { margin: 1cm; size: A4; }
                body { 
                    -webkit-print-color-adjust: exact !important; 
                    print-color-adjust: exact !important; 
                    background-color: white !important;
                }
                .no-print { display: none !important; }
                
                /* Tiled Watermark Background */
                .print-content { 
                    background-image: url('data:image/svg+xml;charset=utf-8,${watermarkSvg}') !important;
                    background-repeat: repeat !important;
                    background-size: 300px 300px !important;
                    color: black !important;
                    box-shadow: none !important;
                    border: none !important;
                }
                
                /* Very Visible Font Styles */
                .prose { color: black !important; font-family: 'Verdana', 'Arial', sans-serif !important; }
                .prose p { color: black !important; font-weight: 500 !important; font-size: 12pt !important; line-height: 1.5 !important; }
                .prose h1 { color: black !important; font-weight: 900 !important; text-transform: uppercase !important; border-bottom: 2px solid #000 !important; padding-bottom: 10px !important; }
                .prose h2, .prose h3 { color: black !important; font-weight: 800 !important; break-after: avoid; page-break-after: avoid; margin-top: 1.5em !important; }
                .prose strong { color: black !important; font-weight: 900 !important; }
                
                /* Header Info for Print */
                .print-header-info { color: #333 !important; font-weight: bold !important; font-family: 'Arial', sans-serif !important; border-bottom: 1px solid #ccc !important; }
                
                img { max-width: 100% !important; page-break-inside: avoid; border: 1px solid #ddd !important; }
            }
        `}</style>

        <div className="max-w-4xl mx-auto px-4 relative" ref={articleRef}>
            
            <div className="flex justify-between items-center mb-6 no-print flex-wrap gap-4">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} /> Back to Universe
                </Link>
                
                <div className="flex gap-3">
                    <div className="relative">
                        <button 
                            onClick={() => setShowLangMenu(!showLangMenu)}
                            disabled={isTranslating || isLoading}
                            className="flex items-center gap-2 bg-slate-800 border border-white/20 text-white px-4 py-2 rounded-full font-medium transition-all hover:bg-slate-700 disabled:opacity-50"
                        >
                            {isTranslating ? <Loader2 size={16} className="animate-spin"/> : <Globe size={16} />}
                            {currentLang} <ChevronDown size={14} />
                        </button>

                        {showLangMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="p-2 border-b border-white/5">
                                    <span className="text-xs text-slate-500 font-bold px-2 uppercase">Select Language</span>
                                </div>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                    {LANGUAGES.map((lang) => (
                                        <button 
                                            key={lang.code}
                                            onClick={() => handleTranslate(lang.name)}
                                            className={`w-full text-left px-4 py-2 hover:bg-white/5 text-sm flex items-center gap-2 transition-colors ${currentLang === lang.name ? 'text-pink-400 font-bold' : 'text-slate-300'}`}
                                        >
                                            {currentLang === lang.name && <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>}
                                            {lang.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button 
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-6 py-2 rounded-full font-bold transition-all shadow-lg hover:shadow-pink-500/25 transform hover:scale-105"
                        >
                            <Download size={18} /> Export <ChevronDown size={14} />
                        </button>
                        
                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="p-2 border-b border-white/5">
                                    <span className="text-xs text-slate-500 font-bold px-2 uppercase">Download As</span>
                                </div>
                                <button onClick={handleDownloadPDF} className="w-full text-left px-4 py-3 hover:bg-white/5 text-white flex items-center gap-3 transition-colors">
                                    {isExporting ? <Loader2 size={16} className="animate-spin text-red-400" /> : <FileText size={16} className="text-red-400" />} PDF Document
                                </button>
                                <button onClick={handleDownloadJpg} className="w-full text-left px-4 py-3 hover:bg-white/5 text-white flex items-center gap-3 transition-colors">
                                    <ImageIcon size={16} className="text-blue-400" /> Image Cover (JPG)
                                </button>
                                <button onClick={handleDownloadTxt} className="w-full text-left px-4 py-3 hover:bg-white/5 text-white flex items-center gap-3 transition-colors">
                                    <FileText size={16} className="text-slate-400" /> Text Script (TXT)
                                </button>
                                <div className="h-px bg-white/10 my-1"></div>
                                <button onClick={handleGenerateVideo} className="w-full text-left px-4 py-3 hover:bg-purple-900/30 text-white flex items-center gap-3 transition-colors">
                                    <Video size={16} className="text-purple-400" /> Generate Video (MP4)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="article-watermark print-content bg-slate-900/50 print:bg-white p-8 md:p-12 rounded-2xl border border-white/5 print:border-none shadow-2xl relative overflow-hidden">
                
                <div className="mb-8 relative z-10">
                    <div className="flex justify-between items-start">
                        <span className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase mb-4 ${item.brandId === 'milele' ? 'bg-slate-100 text-black' : 'bg-pink-600 text-white'} print:border print:border-black print:text-black print:bg-transparent`}>
                            {item.brandId}
                        </span>
                        <div className="hidden print:flex items-center gap-2">
                             <Rocket className="text-black" size={24}/>
                             <span className="text-black font-bold font-sans">SAMONYA DIGITAL UNIVERSE</span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold text-white print:text-black mb-6 leading-tight">
                        {item.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-6 text-slate-400 print-header-info text-sm border-y border-white/10 print:border-gray-300 py-4">
                        <div className="flex items-center gap-2">
                            <span className="text-white print:text-black font-medium">By Samonya AI</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} /> {new Date(item.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} /> 25 min read
                        </div>
                        {currentLang !== 'English' && (
                            <div className="flex items-center gap-2 text-pink-400 print:text-pink-600 font-bold">
                                <Languages size={16} /> Translated to {currentLang}
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative aspect-video rounded-2xl overflow-hidden mb-12 shadow-2xl z-10 print:shadow-none print:border print:border-gray-300">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" crossOrigin="anonymous" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 print:hidden" />
                </div>

                <div className="prose prose-invert prose-lg max-w-none relative z-10">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={48} className="animate-spin text-pink-500 mb-4" />
                            <h3 className="text-xl font-bold text-white">Generating 5000+ Word Deep Dive...</h3>
                            <p className="text-slate-400">Consulting the AI Neural Network for hidden truths.</p>
                        </div>
                    ) : isTranslating ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Globe size={48} className="animate-spin text-blue-500 mb-4" />
                            <h3 className="text-xl font-bold text-white">Translating to {currentLang}...</h3>
                            <p className="text-slate-400">Rewriting content while preserving formatting.</p>
                        </div>
                    ) : (
                        <ReactMarkdown components={components as any}>
                            {articleBody}
                        </ReactMarkdown>
                    )}
                </div>
                
                <div className="mt-12 pt-8 border-t border-white/10 print:border-gray-300 relative z-10 print:break-inside-avoid">
                    <h3 className="text-xl font-bold text-white print:text-black mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {(item.tags || []).map(tag => (
                            <span key={tag} className="px-3 py-1 bg-white/5 print:bg-gray-100 rounded-full text-sm text-slate-300 print:text-gray-800 hover:bg-white/10 cursor-pointer border print:border-gray-300 border-transparent">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="hidden print:block mt-8 text-center text-xs text-gray-500 border-t border-gray-300 pt-4 font-bold">
                    © {new Date().getFullYear()} SAMONYA DIGITAL UNIVERSE. All rights reserved. | Generated by Samonya AI
                </div>
            </div>
        </div>
    </div>
  );
};

export default ArticleView;
