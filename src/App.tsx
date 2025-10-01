import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { LandingPage } from './pages/LandingPage';
import { LiveDetectionPage } from './pages/LiveDetectionPage';
import { ImageAnalysisPage } from './pages/ImageAnalysisPage';
import { SurveillancePage } from './pages/SurveillancePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';

function App() {
  // Set page title based on route
  useEffect(() => {
    const updateTitle = () => {
      const path = window.location.pathname;
      const titles: { [key: string]: string } = {
        '/': 'Indra-Netra - AI Military Vehicle Detection',
        '/detection': 'Live Detection - Indra-Netra',
        '/analysis': 'Image Analysis - Indra-Netra',
        '/surveillance': 'Surveillance Streams - Indra-Netra',
        '/analytics': 'Analytics Dashboard - Indra-Netra',
        '/settings': 'Settings - Indra-Netra',
        '/about': 'About Indian Military - Indra-Netra'
      };
      
      document.title = titles[path] || 'Indra-Netra - AI Military Detection';
    };

    updateTitle();
    window.addEventListener('popstate', updateTitle);
    
    return () => {
      window.removeEventListener('popstate', updateTitle);
    };
  }, []);

  const PageTransition = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );

  const NotFoundPage = () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl font-bold text-orange-500 mb-4">404</div>
          <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
          <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/'}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Return to Home
          </motion.button>
        </motion.div>
      </div>
    </div>
  );

  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-slate-900">
          <Navigation />
          
          <Routes>
            <Route 
              path="/" 
              element={
                <PageTransition>
                  <LandingPage />
                </PageTransition>
              } 
            />
            <Route 
              path="/detection" 
              element={
                <PageTransition>
                  <LiveDetectionPage />
                </PageTransition>
              } 
            />
            <Route 
              path="/analysis" 
              element={
                <PageTransition>
                  <ImageAnalysisPage />
                </PageTransition>
              } 
            />
            <Route 
              path="/surveillance" 
              element={
                <PageTransition>
                  <SurveillancePage />
                </PageTransition>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <PageTransition>
                  <AnalyticsPage />
                </PageTransition>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <PageTransition>
                  <SettingsPage />
                </PageTransition>
              } 
            />
            <Route 
              path="/about" 
              element={
                <PageTransition>
                  <AboutPage />
                </PageTransition>
              } 
            />
            <Route 
              path="*" 
              element={
                <PageTransition>
                  <NotFoundPage />
                </PageTransition>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;