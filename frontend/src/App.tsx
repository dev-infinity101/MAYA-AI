import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { ChatInterface } from './pages/ChatInterface';
import { FeaturesPage } from './pages/Features';
import { AgentsPage } from './pages/Agents';
import { PricingPage } from './pages/Pricing';
import { AboutPage } from './pages/About';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatInterface />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Router>
  );
}

export default App;
