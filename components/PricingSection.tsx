
import React, { useState } from 'react';
import { PLANS } from '../constants';
import { Check, X, Smartphone, Globe, CreditCard, Sparkles, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from '../context/AppContext';

interface PricingProps {
    isLight?: boolean;
}

const PricingSection: React.FC<PricingProps> = ({ isLight = false }) => {
  const { user, updateSubscription } = useApp();
  const navigate = useNavigate();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const handleSubscribeClick = (planId: string) => {
    if (!user) {
      if (window.confirm("You need to sign in to subscribe. Go to login?")) {
        navigate('/login');
      }
      return;
    }
    
    if (planId === 'free') {
      updateSubscription('Free');
      navigate('/welcome-free');
    } else {
      setSelectedPlanId(planId);
    }
  };

  const handlePayment = (method: string) => {
    const plan = PLANS.find(p => p.id === selectedPlanId);
    if (!plan) return;

    let confirmed = false;
    
    if (method === 'mpesa') {
        const message = `Pay via M-Pesa:\n\n1. Go to M-Pesa Menu\n2. Send Money\n3. Phone: 0113558668\n4. Amount: ${plan.price}\n\nOnce you have received the M-Pesa confirmation SMS, click OK to activate premium access immediately.`;
        if (window.confirm(message)) {
            confirmed = true;
        }
    } else if (method === 'minipay') {
        window.open('https://minipay.opera.com/', '_blank');
        if (window.confirm("After completing your MiniPay transaction, click OK to verify.")) {
            confirmed = true;
        }
    } else if (method === 'other') {
        if(window.confirm("Simulate successful payment for testing?")) {
            confirmed = true;
        }
    }

    if (confirmed) {
        const planType = selectedPlanId === 'yearly' ? 'Yearly' : 'Monthly';
        updateSubscription(planType);
        alert(`Payment Successful! You have unlocked ${plan.name} features.`);
        setSelectedPlanId(null);
        // Redirect to Home after successful payment
        navigate('/');
    }
  };

  return (
    <>
      <section className={`py-10 px-4 relative overflow-hidden ${isLight ? 'text-slate-900' : 'text-white'}`}>
        <div className="relative max-w-7xl mx-auto z-10">
          <div className="text-center mb-10">
              <span className="inline-block py-1 px-3 rounded-full bg-pink-500/20 text-pink-400 text-xs font-bold tracking-widest uppercase mb-4 border border-pink-500/30">
                  Premium Access
              </span>
              <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
                  Unlock the <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Full Universe</span>
              </h2>
              <p className={`text-base max-w-2xl mx-auto ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Choose a plan to continue.
              </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(PLANS || []).map((plan) => {
              const isCurrent = user?.plan?.toLowerCase() === plan.id;
              const isPremium = plan.isPremium;
              
              return (
                <div 
                  key={plan.id}
                  className={`relative rounded-3xl p-6 transition-all duration-500 flex flex-col group ${
                    isPremium 
                      ? 'bg-slate-900/80 border-2 border-purple-500/30 hover:border-purple-500/80 shadow-2xl hover:shadow-purple-500/20 transform hover:-translate-y-2 backdrop-blur-md' 
                      : `${isLight ? 'bg-white border-2 border-slate-200' : 'bg-slate-800/40 border-2 border-white/5'} hover:border-white/20 hover:-translate-y-1`
                  }`}
                >
                  {/* Glow Effect for Premium */}
                  {isPremium && (
                      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  )}

                  {plan.id === 'yearly' && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs uppercase font-extrabold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1 z-20">
                      <Sparkles size={12} fill="currentColor" /> Best Value
                    </div>
                  )}
                  
                  {plan.id === 'family' && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs uppercase font-extrabold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap z-20">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6">
                      <h3 className={`text-xl font-bold mb-2 ${isPremium ? 'text-white' : isLight ? 'text-slate-900' : 'text-slate-300'}`}>
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-black ${isPremium ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400' : isLight ? 'text-slate-900' : 'text-white'}`}>
                            {plan.price}
                        </span>
                      </div>
                  </div>

                  <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"></div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    {(plan.features || []).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs">
                        <div className={`mt-0.5 rounded-full p-1 shrink-0 ${isPremium ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                          <Check size={8} strokeWidth={4} />
                        </div>
                        <span className={isLight && !isPremium ? 'text-slate-600' : 'text-slate-300'}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribeClick(plan.id)}
                    disabled={isCurrent}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 mt-auto z-10
                      ${isCurrent 
                        ? 'bg-green-500/10 text-green-500 cursor-default border border-green-500/20'
                        : isPremium 
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg shadow-purple-900/40 hover:shadow-purple-500/40' 
                          : `${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-900' : 'bg-white/10 hover:bg-white/20 text-white'}`
                      }`}
                  >
                    {isCurrent ? 'Current Plan' : (
                        <>
                           {isPremium ? <Zap size={14} fill="currentColor" /> : null} Select Plan
                        </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      {selectedPlanId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200">
           <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full p-8 relative shadow-2xl overflow-hidden">
              {/* Modal Background Effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl -z-10"></div>
              
              <button 
                onClick={() => setSelectedPlanId(null)} 
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-2xl font-black text-white mb-2">Secure Checkout</h3>
              <p className="text-slate-400 text-sm mb-8">Choose your preferred payment method.</p>
              
              <div className="space-y-4">
                {/* M-Pesa */}
                <button 
                    onClick={() => handlePayment('mpesa')} 
                    className="w-full flex items-center justify-between p-5 rounded-2xl bg-green-500/5 border border-green-500/20 hover:bg-green-500/10 hover:border-green-500/50 transition-all text-white group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                           <Smartphone size={24} />
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-lg">M-Pesa</span>
                            <span className="text-xs text-green-400 font-mono tracking-wide">0113558668</span>
                        </div>
                    </div>
                </button>

                {/* MiniPay */}
                 <button 
                    onClick={() => handlePayment('minipay')} 
                    className="w-full flex items-center justify-between p-5 rounded-2xl bg-orange-500/5 border border-orange-500/20 hover:bg-orange-500/10 hover:border-orange-500/50 transition-all text-white group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                           <CreditCard size={24} />
                        </div>
                        <span className="font-bold text-lg">MiniPay</span>
                    </div>
                </button>
                
                 {/* Generic */}
                 <button 
                    onClick={() => handlePayment('other')} 
                    className="w-full flex items-center justify-between p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all text-white group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                           <Globe size={24} />
                        </div>
                        <span className="font-bold text-lg">Card / Other</span>
                    </div>
                </button>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                 <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span> Secure Digital Transaction
                 </p>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default PricingSection;
