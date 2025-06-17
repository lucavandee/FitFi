import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
import QuestionnairePage from './pages/QuestionnairePage';
import RecommendationsPage from './pages/RecommendationsPage';
import DashboardPage from './pages/DashboardPage';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/animations.css';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-neutral-50">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/questionnaire" element={<QuestionnairePage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/dashboard/*" element={<DashboardPage />} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-center" />
          </div>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;