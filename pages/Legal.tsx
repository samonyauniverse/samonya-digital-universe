import React from 'react';
import { useLocation, Link } from '../context/AppContext';
import { Shield, FileText, ArrowLeft } from 'lucide-react';

const Legal: React.FC = () => {
  const { pathname } = useLocation();
  const isPrivacy = pathname === '/privacy';

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-4xl mx-auto text-slate-300">
      <Link to="/" className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
          <div className={`p-4 rounded-full ${isPrivacy ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
            {isPrivacy ? <Shield size={32} /> : <FileText size={32} />}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
          </h1>
        </div>

        <div className="space-y-8 leading-relaxed">
          {isPrivacy ? (
            <>
              <section>
                <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
                <p>
                  At Samonya Digital Universe, we prioritize your privacy. We collect information you provide directly to us, 
                  such as when you create an account, subscribe to a plan, or contact us. This may include your name, email address, 
                  phone number (for M-Pesa transactions), and payment information.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
                <p>
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Provide, maintain, and improve our digital services.</li>
                  <li>Process transactions and manage your subscriptions.</li>
                  <li>Send you technical notices, updates, and support messages.</li>
                  <li>Respond to your comments, questions, and customer service requests.</li>
                  <li>Monitor trends and usage in connection with our services (e.g., viewing history).</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">3. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal data against unauthorized 
                  access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we 
                  cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">4. Cookies and Tracking</h2>
                <p>
                  We use local storage and cookies to maintain your login session and preferences (such as your theme or volume settings). 
                  By using our service, you consent to the use of these technologies.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">5. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at: <br />
                  <span className="text-white font-medium">samonyadigital@gmail.com</span>
                </p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
                <p>
                  By accessing or using the Samonya Digital Universe website and services, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">2. User Accounts</h2>
                <p>
                  To access certain features (like Premium Content or Live Streaming), you may be required to register for an account. 
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur 
                  under your account.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">3. Premium Subscriptions & Payments</h2>
                <p>
                  Some content is available only to paid subscribers. We accept payments via M-Pesa, PayPal, and MiniPay. 
                  All payments are final and non-refundable unless otherwise stated in our refund policy or required by law. 
                  Subscription plans renew automatically unless cancelled.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">4. Content Usage & Copyright</h2>
                <p>
                  All content provided on Samonya Digital Universe (music, videos, articles) is the property of Samonya or its licensors 
                  and is protected by copyright laws. You may not distribute, modify, transmit, reuse, download, or use the content 
                  for public or commercial purposes without written permission.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">5. Live Streaming Conduct</h2>
                <p>
                  When using Samonya Live, you agree not to broadcast content that is illegal, hateful, explicit, or violates intellectual 
                  property rights. We reserve the right to terminate accounts that violate these guidelines.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">6. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. We will provide notice of significant changes by posting the 
                  updated terms on our website.
                </p>
              </section>
            </>
          )}
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-slate-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default Legal;