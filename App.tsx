
import React, { useEffect, useState } from 'react';
import { CustomRouter as Router, Routes, Route, Navigate } from './context/AppContext';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import BrandPage from './pages/BrandPage';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Live from './pages/Live';
import Legal from './pages/Legal';
import ArticleView from './pages/ArticleView';
import IntroLogo from './components/IntroLogo';
import WelcomeFree from './pages/WelcomeFree';
import Latest from './pages/Latest';

// Splash Screen Component
const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [fading, setFading] = useState(false);

  const handleComplete = () => {
    setFading(true);
    // Slight buffer after animation completes before unmounting
    setTimeout(onFinish, 1000); 
  };

  return (
    <div className={`fixed inset-0 bg-[#020617] z-[100] flex flex-col items-center justify-center transition-opacity duration-1000 ${fading ? 'opacity-0' : 'opacity-100'}`}>
      <IntroLogo onComplete={handleComplete} />
    </div>
  );
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <SplashScreen onFinish={() => setLoading(false)} />;
  }

  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Specific Functional Pages - Must come before generic /:id */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/live" element={<Live />} />
            <Route path="/article/:id" element={<ArticleView />} />
            <Route path="/welcome-free" element={<WelcomeFree />} />
            <Route path="/latest" element={<Latest />} />
            
            {/* Legal Pages */}
            <Route path="/privacy" element={<Legal />} />
            <Route path="/terms" element={<Legal />} />

            {/* Redirects */}
            <Route path="/about" element={<Navigate to="/" replace />} />
            <Route path="/blog" element={<Navigate to="/tv" replace />} />
            
            {/* Dynamic Route for Brand Pages (e.g., /milele, /kids, etc.) - Must be last */}
            <Route path="/:id" element={<BrandPage />} />
            
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
};

export default App;
