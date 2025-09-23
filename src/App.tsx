import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import Navbar from '@/components/layout/Navbar';
import HomePage from '@/pages/HomePage';
import BlogPage from '@/pages/BlogPage';
import AboutPage from '@/pages/AboutPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <a href="#main-content" className="skip-link">
          Naar hoofdinhoud
        </a>
        <Navbar />
        
        <ErrorBoundary>
          <main id="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/over-ons" element={<AboutPage />} />
            </Routes>
          </main>
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  );
}

export default App;