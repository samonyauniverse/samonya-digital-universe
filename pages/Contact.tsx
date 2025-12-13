import React, { useState } from 'react';
import { Mail, Phone, Instagram, Facebook } from 'lucide-react';

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleWhatsApp = () => {
    // Open WhatsApp with the provided number
    window.open('https://wa.me/254113558668', '_blank');
  };

  const handleEmailDirect = () => {
      window.location.href = 'mailto:samonyadigital@gmail.com';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Direct user to email client with pre-filled subject and body
    const subject = `Contact from ${name}`;
    const body = `${message}\n\nFrom: ${name} (${email})`;
    window.location.href = `mailto:samonyadigital@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center text-white">Get in Touch</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-800 p-8 rounded-2xl border border-white/5">
          <h2 className="text-2xl font-bold mb-6 text-pink-400">Contact Info</h2>
          
          <div className="space-y-6">
            <button 
                onClick={handleWhatsApp}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400 group-hover:text-green-400 transition-colors">WhatsApp / Phone</p>
                <p className="text-lg text-white font-semibold">+254 113 558 668</p>
                <p className="text-xs text-slate-500">Click to Chat on WhatsApp</p>
              </div>
            </button>

            <button 
                onClick={handleEmailDirect}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400 group-hover:text-blue-400 transition-colors">Email</p>
                <p className="text-lg text-white font-semibold break-all">samonyadigital@gmail.com</p>
                <p className="text-xs text-slate-500">Click to Email</p>
              </div>
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="font-bold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/samonyadigitaluniverse?igsh=ZDJrdHgweTNwNHVh" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 bg-white/5 rounded-full hover:bg-pink-500 hover:text-white transition-colors"
              >
                <Instagram size={20}/>
              </a>
              <a 
                href="https://x.com/SamonyaDU?t=Ul5b1lM81AxJgM7J_Ov3Hg&s=09" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 bg-white/5 rounded-full hover:bg-black hover:text-white transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a 
                href="https://www.facebook.com/share/1DJUz23eKr/" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 bg-white/5 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
              >
                <Facebook size={20}/>
              </a>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-8 rounded-2xl border border-white/5">
          <h2 className="text-2xl font-bold mb-6 text-purple-400">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
                type="text" 
                placeholder="Your Name" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors" 
            />
            <input 
                type="email" 
                placeholder="Your Email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors" 
            />
            <textarea 
                rows={4} 
                placeholder="How can we help?" 
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors"
            ></textarea>
            <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
              Send Message (Opens Email App)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;