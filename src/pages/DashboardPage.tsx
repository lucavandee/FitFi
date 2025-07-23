import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Settings, 
  Heart, 
  TrendingUp, 
  Award, 
  Calendar,
  ShoppingBag,
  Camera,
  Edit3,
  Crown,
  Gift
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useGamification } from '../context/GamificationContext';
import Button from '../components/ui/Button';
import LoadingFallback from '../components/ui/LoadingFallback';

// Lazy load dashboard components
const ProfileOverview = React.lazy(() => import('../components/dashboard/ProfileOverview'));
const SavedOutfits = React.lazy(() => import('../components/dashboard/SavedOutfits'));
const StylePreferences = React.lazy(() => import('../components/dashboard/StylePreferences'));
const AccountSettings = React.lazy(() => import('../components/dashboard/AccountSettings'));
const GamificationDashboard = React.lazy(() => import('../components/dashboard/GamificationDashboard'));

const DashboardPage: React.FC = () => {
  const { user, isLoading } = useUser();
  const { points, level, badges } = useGamification();
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
    return <LoadingFallback fullScreen message="Dashboard laden..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Inloggen vereist</h2>
          <p className="mb-6">Je moet ingelogd zijn om je dashboard te bekijken.</p>
          <Button as={Link} to="/login" variant="primary">
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overzicht', icon: <User size={20} />, path: '/dashboard' },
    { id: 'outfits', label: 'Opgeslagen Outfits', icon: <Heart size={20} />, path: '/dashboard/outfits' },
    { id: 'preferences', label: 'Stijlvoorkeuren', icon: <TrendingUp size={20} />, path: '/dashboard/preferences' },
    { id: 'gamification', label: 'Achievements', icon: <Award size={20} />, path: '/dashboard/gamification' },
    { id: 'settings', label: 'Instellingen', icon: <Settings size={20} />, path: '/dashboard/settings' }
  ];

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        {/* Header */}
        <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-secondary mb-2">
                Welkom terug, {user.name}!
              </h1>
              <p className="text-gray-600">
                Beheer je stijlprofiel en bekijk je aanbevelingen
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {user.isPremium && (
                <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  <Crown size={16} className="mr-1" />
                  Premium
                </div>
              )}
              
              <div className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                Level {level} • {points} punten
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                  activeTab === tab.id
                    ? 'bg-secondary text-primary font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg">
          <React.Suspense fallback={<LoadingFallback message="Inhoud laden..." />}>
            <Routes>
              <Route index element={<ProfileOverview />} />
              <Route path="outfits" element={<SavedOutfits />} />
              <Route path="preferences" element={<StylePreferences />} />
              <Route path="gamification" element={<GamificationDashboard />} />
              <Route path="settings" element={<AccountSettings />} />
            </Routes>
          </React.Suspense>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg text-center">
            <Camera className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload nieuwe foto</h3>
            <p className="text-gray-600 mb-4">Krijg nog nauwkeurigere aanbevelingen</p>
            <Button variant="secondary" size="sm">
              Upload foto
            </Button>
          </div>

          <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg text-center">
            <Edit3 className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Update voorkeuren</h3>
            <p className="text-gray-600 mb-4">Verfijn je stijlprofiel</p>
            <Button 
              as={Link} 
              to="/dashboard/preferences" 
              variant="secondary" 
              size="sm"
            >
              Bewerk voorkeuren
            </Button>
          </div>

          <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg text-center">
            <ShoppingBag className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nieuwe aanbevelingen</h3>
            <p className="text-gray-600 mb-4">Ontdek fresh outfits</p>
            <Button 
              as={Link} 
              to="/results" 
              variant="primary" 
              size="sm"
            >
              Bekijk outfits
            </Button>
          </div>
        </div>

        {/* Premium Upgrade CTA */}
        {!user.isPremium && (
          <div className="mt-8 bg-gradient-to-r from-secondary/20 to-secondary/10 p-6 rounded-2xl shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-bold text-secondary mb-2">
                  Upgrade naar Premium
                </h3>
                <p className="text-body">
                  Krijg onbeperkte aanbevelingen, geavanceerde analyses en exclusieve functies
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-secondary">€9.99</p>
                  <p className="text-sm text-body">per maand</p>
                </div>
                <Button variant="primary">
                  <Gift size={16} className="mr-2" />
                  Upgrade nu
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;