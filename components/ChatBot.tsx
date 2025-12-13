
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { X, Send, Loader2, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BRANDS, PLANS } from '../constants';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Ensure this file exists in your public folder
const SAMN_AI_LOGO = "/samn_ai_logo.jpg";

const ChatBot: React.FC = () => {
  const { content } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "hello am samn ai thank you for contacting us ,how can I help you today",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imgError, setImgError] = useState(false); // Track image loading error
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);

  // Generate the dynamic system instruction based on current app state
  const systemInstruction = useMemo(() => {
    const safeContent = Array.isArray(content) ? content : [];
    const contentDatabase = safeContent.map(item => 
      `- Title: "${item.title}" | Type: ${item.type} | Brand: ${item.brandId} | Premium: ${item.isPremium ? 'Yes' : 'No'} | Description: ${item.description}`
    ).join('\n');

    const brandDatabase = (BRANDS || []).map(b => 
      `- ${b.name} (${b.tagline}): ${b.description}`
    ).join('\n');

    const planDatabase = (PLANS || []).map(p => 
      `- ${p.name}: ${p.price} (Features: ${p.features.join(', ')})`
    ).join('\n');

    return `You are SAMN AI, the official intelligent assistant for SAMONYA DIGITAL UNIVERSE.
Your goal is to help users navigate the platform, answer FAQs, and provide support based strictly on the provided database.

**Your Identity:**
- Name: SAMN AI
- **IMPORTANT**: You have already introduced yourself. Do NOT repeat the greeting "hello am samn ai...".
- Answer the user's question directly and concisely without unnecessary pleasantries.

**INSTRUCTIONS FOR ANSWERING:**
1. **SEARCH THE DATABASE**: Before answering, you must "look" through the DATABASE sections below to find the correct information.
2. **BE ACCURATE**: Only provide information that exists in the database. If a user asks for a song or video not listed, say you couldn't find it in the current library.
3. **LATEST UPDATES**: The database below represents the absolute latest updates to the website.

**KNOWLEDGE BASE / DATABASE:**

**1. CONTENT LIBRARY (Real-time):**
${contentDatabase}

**2. BRANDS:**
${brandDatabase}

**3. PRICING PLANS:**
${planDatabase}

**4. PAYMENT METHODS:**
- **M-Pesa**: Number 0113558668.
- **PayPal**: Available for international payments.
- **MiniPay**: Supported.
- *Process*: Users select a plan, choose a method, and upon successful payment, access is granted.

**5. CONTACT INFO:**
- WhatsApp/Phone: +254 113 558 668
- Email: samonyadigital@gmail.com

**6. ADMIN ACCESS:**
- Restricted to: snmomanyik@gmail.com and samonyadigital@gmail.com ONLY.
- Features: Admins can upload files up to 500MB.

**7. LIVE FEATURES:**
- Users can stream video and audio.
- Features include: Recording, Multi-host (Invite Co-host), Live Chat, Love interactions (with sound).
- Notifications are sent when streaming starts.

**Behavior:**
- Be helpful, polite, and concise.
- If the user asks about something unrelated to Samonya, politely guide them back.
`;
  }, [content]);

  // Initialize Chat Session safely
  useEffect(() => {
    const initChat = async () => {
      try {
        if (!process.env.API_KEY) {
          console.warn("API Key not found for ChatBot");
          return;
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatSessionRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: systemInstruction,
          },
        });
      } catch (error) {
        console.error("Failed to initialize ChatBot:", error);
      }
    };
    initChat();
  }, [systemInstruction]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatSessionRef.current) {
         const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
         chatSessionRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: { systemInstruction: systemInstruction },
        });
      }

      if (chatSessionRef.current) {
        const result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: result.text,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting to the universe right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render Avatar
  const renderAvatar = (className: string) => {
    if (imgError) {
      return (
        <div className={`${className} bg-slate-200 flex items-center justify-center`}>
          <User className="text-slate-500 w-1/2 h-1/2" />
        </div>
      );
    }
    return (
      <img 
        src={SAMN_AI_LOGO} 
        alt="SAMN AI" 
        className={className} 
        onError={() => setImgError(true)} 
      />
    );
  };

  return (
    <div className="fixed bottom-24 right-6 z-[60] flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-slate-900 border border-pink-500 rounded-2xl shadow-2xl w-80 sm:w-96 mb-4 overflow-hidden flex flex-col pointer-events-auto animate-in fade-in slide-in-from-bottom-10 duration-300">
          {/* Header */}
          <div className="bg-pink-600 p-4 flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-0.5 overflow-hidden shadow-md">
                {renderAvatar("w-full h-full object-cover rounded-full")}
              </div>
              <div>
                <h3 className="font-bold text-white text-base">SAMN AI</h3>
                <span className="flex items-center gap-1 text-[10px] text-pink-100 font-medium">
                   <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-white/80 hover:text-white transition-colors bg-white/10 p-1 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 h-80 overflow-y-auto bg-slate-900/95 space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full mr-2 self-end mb-1 border border-white/20 bg-white overflow-hidden shrink-0">
                    {renderAvatar("w-full h-full object-cover")}
                  </div>
                )}
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-md ${
                    msg.sender === 'user' 
                      ? 'bg-pink-600 text-white rounded-br-none' 
                      : 'bg-slate-800 text-slate-200 border border-white/10 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start items-end">
                 <div className="w-8 h-8 rounded-full mr-2 mb-1 bg-white overflow-hidden shrink-0 border border-white/20">
                    {renderAvatar("w-full h-full object-cover")}
                 </div>
                 <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-white/10 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-pink-500" />
                    <span className="text-xs text-slate-400">Typing...</span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-white/10 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask SAMN AI..."
              className="flex-1 bg-slate-800 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors placeholder:text-slate-500"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white p-2 rounded-full transition-colors shadow-lg"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-pink-600 hover:bg-pink-500 text-white p-0 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.6)] transition-all hover:scale-110 flex items-center justify-center group w-16 h-16 relative overflow-hidden border-2 border-white/20"
      >
        {isOpen ? (
          <X size={28} />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center bg-white">
            {renderAvatar("w-full h-full object-cover")}
            {/* Notification Dot */}
            <span className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white z-10 animate-pulse"></span>
          </div>
        )}
      </button>
    </div>
  );
};

export default ChatBot;
