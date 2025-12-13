
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from '../context/AppContext';
import { Lock, Mail, User } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

const Login: React.FC = () => {
  const { login, register } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      login(email);
      navigate('/profile');
    } else if (mode === 'register') {
      register(name, email);
      navigate('/profile');
    } else {
      alert("Password reset link sent to your email!");
      setMode('login');
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="bg-slate-800 p-8 rounded-2xl border border-white/5 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-slate-500" size={20} />
              <input 
                type="text" 
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full bg-slate-900 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-slate-500" size={20} />
            <input 
              type="email" 
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
            />
          </div>

          {mode !== 'forgot' && (
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-500" size={20} />
              <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-slate-900 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
              />
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all mt-6"
          >
            {mode === 'login' && 'Sign In'}
            {mode === 'register' && 'Create Account'}
            {mode === 'forgot' && 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-center text-sm text-slate-400">
          {mode === 'login' ? (
            <>
              <p>Don't have an account? <span onClick={() => setMode('register')} className="text-pink-400 cursor-pointer hover:underline">Sign Up</span></p>
              <span onClick={() => setMode('forgot')} className="text-slate-500 cursor-pointer hover:text-slate-300">Forgot Password?</span>
            </>
          ) : mode === 'register' ? (
            <p>Already have an account? <span onClick={() => setMode('login')} className="text-pink-400 cursor-pointer hover:underline">Sign In</span></p>
          ) : (
            <span onClick={() => setMode('login')} className="text-pink-400 cursor-pointer hover:underline">Back to Login</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
