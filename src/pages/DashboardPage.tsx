import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  Heart, 
  TrendingUp, 
  Award, 
  Calendar,
  BarChart3
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import Button from '../components/ui/Button';
import LoadingFallback from '../components/ui/LoadingFallback';
import ErrorBoundary from '../components/ErrorBoundary';

// Import new dashboard components
import WelcomeSection from '../components/dashboard/WelcomeSection';
import AIStyleReport from '../components/dashboard/AIStyleReport';
import OutfitOfTheDay from '../components/dashboard/OutfitOfTheDay';
import WishlistSection from '../components/dashboard/WishlistSection';
import StyleStatistics from '../components/dashboard/StyleStatistics';
import CommunityChallenge from '../components/dashboard/CommunityChallenge';
import FeedbackSection from '../components/dashboard/FeedbackSection';
import DashboardFooter from '../components/dashboard/DashboardFooter';

// Lazy load dashboard components
const ProfileOverview = React.lazy(() => 
  import('../components/dashboard/ProfileOverview').catch(() => ({ default: () => <div>Component niet beschikbaar</div> }))
);
const SavedOutfits = React.lazy(() => import('../components/dashboard/SavedOutfits'));
const StylePreferences = React.lazy(() => import('../components/dashboard/StylePreferences'));
const AccountSettings = React.lazy(() => import('../components/dashboard/AccountSettings'));
const GamificationDashboard = React.lazy(() => import('../components/dashboard/GamificationDashboard'));

const DashboardPage: React.FC = () => {
  const { user, isLoading } = useUser();
  const location = useLocation(); 
  const [activeTab, setActiveTab] = useState('overview');

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path && ['overview', 'outfits', 'preferences', 'settings', 'gamification'].includes(path)) {
      setActiveTab(path);
    }
  }, [location]);

  if (isLoading) {
    return <LoadingFallback fullScreen message="Nova dashboard laden..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Inloggen vereist</h2>
          <p className="mb-6">Je moet ingelogd zijn om Nova te gebruiken.</p>
          <Button as={Link} to="/login" variant="primary">
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overzicht', icon: <User size={20} />, path: '/dashboard' },
    { id: 'outfits', label: 'Wishlist', icon: <Heart size={20} />, path: '/dashboard/outfits' },
    { id: 'preferences', label: 'Stijlvoorkeuren', icon: <TrendingUp size={20} />, path: '/dashboard/preferences' },
    { id: 'statistics', label: 'Statistieken', icon: <BarChart3 size={20} />, path: '/dashboard/statistics' },
    { id: 'settings', label: 'Instellingen', icon: <Settings size={20} />, path: '/dashboard/settings' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F6]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 space-y-8">
        
        {/* Main Dashboard Content */}
        <ErrorBoundary>
          <React.Suspense fallback={<LoadingFallback message="Dashboard laden..." />}>
            <Routes>
              <Route index element={
                <div className="space-y-8">
                  {/* Welcome Section */}
                  <WelcomeSection />
                  
                  {/* AI Style Report */}
                  <AIStyleReport />
                  
                  {/* Outfit of the Day */}
                  <OutfitOfTheDay />
                  
                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <WishlistSection />
                    <StyleStatistics />
                  </div>
                  
                  {/* Community Challenge */}
                  <CommunityChallenge />
                  
                  {/* Feedback Section */}
                  <FeedbackSection />
                </div>
              } />
              <Route path="outfits" element={<SavedOutfits />} />
              <Route path="preferences" element={<StylePreferences />} />
              <Route path="statistics" element={<StyleStatistics />} />
              <Route path="settings" element={<AccountSettings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </React.Suspense>
        </ErrorBoundary>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-3xl p-6 shadow-sm sticky bottom-4 z-10">
          <div className="flex justify-center">
            <div className="flex bg-gray-50 rounded-2xl p-1">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-[#bfae9f] font-medium shadow-sm'
                    : 'text-gray-600 hover:text-[#bfae9f]'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <ErrorBoundary>
          <DashboardFooter />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default DashboardPage;