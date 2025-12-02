import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { BrandPage } from './pages/BrandPage';
import { Pricing } from './pages/Pricing';
import { Blog } from './pages/Blog';
import { Contact } from './pages/Contact';
import { Auth } from './pages/Auth';
import { BrandId } from './types';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Brand Specific Routes mapped to Generic BrandPage */}
          <Route path="/milele" element={<BrandPage brandId={BrandId.MILELE} />} />
          <Route path="/kids" element={<BrandPage brandId={BrandId.KIDS} />} />
          <Route path="/sky" element={<BrandPage brandId={BrandId.SKY} />} />
          <Route path="/tv" element={<BrandPage brandId={BrandId.TV} />} />
          <Route path="/films" element={<BrandPage brandId={BrandId.FILMS} />} />
          
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Catch all redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;