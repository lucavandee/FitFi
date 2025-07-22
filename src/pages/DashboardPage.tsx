import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { 
  User, 
  Settings, 
  ShoppingBag, 
  Heart, 
  Award, 
  Clock, 
  Sparkles,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import Button from '../components/ui/Button';
import AchievementCard from '../components/ui/AchievementCard';
import DailyChallengeCard from '../components/ui/DailyChallengeCard';
import LeaderboardCard from '../components/ui/LeaderboardCard';
import ReferralWidget from '../components/ui/ReferralWidget';
import GamificationBanner from '../components/ui/GamificationBanner';
import { useGamification } from '../context/GamificationContext';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import { getDataSource } from '../services/DataRouter';

// Define types for profile attributes
interface ProfileAttributes {
  style?: string;
  preferences?: {
    [key: string]: number | string | boolean;
  };
  sizes?: {
    [key: string]: string | number;
  };
  favoriteColors?: string[];
  favoriteRetailers?: string[];
  [key: string]: any; // Allow for additional dynamic attributes
}

const DashboardPage: React.FC = () => {
  const { user, isLoading, error } = useUser();
  const { points, level, streak } = useGamification();
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'saved' | 'settings'>('overview');
  const [dataSource, setDataSource] = useState<'supabase' | 'zalando' | 'local'>(getDataSource());

  // Update data source when it changes
  useEffect(() => {
    const currentSource = getDataSource();
    if (dataSource !== currentSource) {
      setDataSource(currentSource);
    }
  }, []);

  // Safe access to profile attributes with fallbacks
  const profileAttributes: ProfileAttributes = {
    style: 'Casual Chic',
    preferences: {
      casual: user?.stylePreferences?.casual || 3,
      formal: user?.stylePreferences?.formal || 3,
      sporty: user?.stylePreferences?.sporty || 3,
      vintage: user?.stylePreferences?.vintage || 3,
      minimalist: user?.stylePreferences?.minimalist || 3
    },
    sizes: {
      top: 'M',
      bottom: '32',
      shoes: '42'
    },
    favoriteColors: ['Navy', 'Beige', 'White'],
    favoriteRetailers: ['Zalando', 'H&M', 'ASOS']
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-midnight-950 to-midnight-800 py-12">
        <div className="container-slim">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-turquoise-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-textSecondary-light dark:text-textSecondary-dark font-medium">Dashboard laden...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-midnight-950 to-midnight-800 py-12">
        <div className="container-slim">
          <div className="bg-white dark:bg-midnight-800 rounded-xl shadow-md p-8 max-w-xl mx-auto text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-textPrimary-light dark:text-textPrimary-dark mb-3">
              Er is iets misgegaan
            </h2>
            <p className="text-textSecondary-light dark:text-textSecondary-dark mb-6">
              We konden je profielgegevens niet laden. Probeer het later opnieuw of neem contact op met onze support.
            </p>
            <Button 
              variant="primary"
              onClick={() => window.location.reload()}
            >
              Vernieuwen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Profile section component with safe rendering
  const ProfileSection = () => {
    // Ensure we have valid objects before using Object.entries
    const preferences = profileAttributes.preferences || {};
    const sizes = profileAttributes.sizes || {};
    const favoriteColors = profileAttributes.favoriteColors || [];
    const favoriteRetailers = profileAttributes.favoriteRetailers || [];

    return (
      <div className="space-y-8">
        {/* User Info */}
        <div className="card">
          <div className="flex items-center mb-6">
            <div className="bg-turquoise/20 p-3 rounded-full mr-4">
              <User className="text-turquoise" size={24} />
            </div>
            <h2 className="text-h2 text-text-primary mb-4">
              Persoonlijke Informatie
            </h2>
          </div>
          
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
            <div className="card-section">
              <p className="text-base text-text-secondary mb-1">Naam</p>
              <p className="text-text-primary font-medium">{user.name}</p>
            </div>
            <div className="card-section">
              <p className="text-base text-text-secondary mb-1">E-mail</p>
              <p className="text-text-primary font-medium">{user.email}</p>
            </div>
            <div className="card-section">
              <p className="text-base text-text-secondary mb-1">Gender</p>
              <p className="text-text-primary font-medium">{user.gender || 'Niet opgegeven'}</p>
            </div>
            <div className="card-section">
              <p className="text-base text-text-secondary mb-1">Abonnement</p>
              <p className="text-text-primary font-medium">{user.isPremium ? 'Premium' : 'Basis'}</p>
            </div>
          </div>
          
          {/* Data source indicator */}
          <div className="mt-6 card-section">
            <p className="text-base text-text-secondary mb-1">Databron</p>
            <p className="text-text-primary font-medium flex items-center">
              {dataSource === 'supabase' ? (
                <>📦 Supabase</>
              ) : dataSource === 'zalando' ? (
                <>🛍️ Zalando</>
              ) : (
                <>🧪 Lokaal</>
              )}
            </p>
          </div>
        </div>

        {/* Style Preferences */}
        <div className="card">
          <div className="flex items-center mb-6">
            <div className="bg-turquoise/20 p-3 rounded-full mr-4">
              <Sparkles className="text-turquoise" size={24} />
            </div>
            <h2 className="text-h2 text-text-primary mb-4">
              Stijlvoorkeuren
            </h2>
          </div>
          
          <div className="space-y-8">
            {/* Style Type */}
            {profileAttributes.style && (
              <div className="card-section">
                <p className="text-base text-text-secondary mb-1">Stijltype</p>
                <p className="text-text-primary font-medium">{profileAttributes.style}</p>
              </div>
            )}
            
            {/* Style Preferences */}
            {Object.keys(preferences).length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-4">Stijlvoorkeuren</h3>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  {Object.entries(preferences).map(([key, value]) => (
                    <div key={key} className="card-section">
                      <p className="text-base text-text-secondary mb-1">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                      <div className="flex items-center">
                        <div className="progress-bar-track mr-2">
                          <div 
                            className="progress-bar-fill" 
                            style={{ width: `${typeof value === 'number' ? (value / 5) * 100 : 60}%` }}
                          ></div>
                        </div>
                        <span className="text-text-primary font-medium">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Sizes */}
            {Object.keys(sizes).length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-4">Maten</h3>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
                  {Object.entries(sizes).map(([key, value]) => (
                    <div key={key} className="card-section">
                      <p className="text-base text-text-secondary mb-1">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                      <p className="text-text-primary font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Favorite Colors */}
            {favoriteColors.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-4">Favoriete Kleuren</h3>
                <div className="flex flex-wrap gap-2">
                  {favoriteColors.map((color, index) => (
                    <span key={index} className="bg-light-grey px-3 py-1 rounded-full text-text-primary font-medium">
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Favorite Retailers */}
            {favoriteRetailers.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-4">Favoriete Winkels</h3>
                <div className="flex flex-wrap gap-2">
                  {favoriteRetailers.map((retailer, index) => (
                    <span key={index} className="bg-light-grey px-3 py-1 rounded-full text-text-primary font-medium">
                      {retailer}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Saved outfits section
  const SavedOutfitsSection = () => {
    const savedOutfits = user.savedRecommendations || [];
    
    return (
      <div className="space-y-8">
        <div className="card">
          <div className="flex items-center mb-6">
            <div className="bg-turquoise/20 p-3 rounded-full mr-4">
              <Heart className="text-turquoise" size={24} />
            </div>
            <h2 className="text-h2 text-text-primary mb-4">
              Opgeslagen Outfits
            </h2>
          </div>
          
          {savedOutfits.length > 0 ? (
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
              {savedOutfits.map((id, index) => (
                <div key={id} className="card-section flex items-center">
                  <div className="w-16 h-16 bg-light-grey rounded-lg mr-6 flex items-center justify-center">
                    <Heart className="text-turquoise" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-text-primary font-medium">Outfit #{index + 1}</p>
                    <p className="text-text-secondary text-sm">{id.substring(0, 8)}...</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-text-primary border border-light-grey hover:bg-light-grey"
                    icon={<ChevronRight size={16} />}
                    iconPosition="right"
                  >
                    Bekijk
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-light-grey rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="text-text-primary" size={24} />
              </div>
              <p className="text-base text-text-secondary mb-4">
                Je hebt nog geen outfits opgeslagen. Bekijk aanbevelingen en sla je favorieten op.
              </p>
              <Button 
                variant="primary"
                onClick={() => window.location.href = '/results'}
              >
                Aanbevelingen bekijken
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Settings section
  const SettingsSection = () => {
    return (
      <div className="space-y-8">
        <div className="card">
          <div className="flex items-center mb-6">
            <div className="bg-turquoise/20 p-3 rounded-full mr-4">
              <Settings className="text-turquoise" size={24} />
            </div>
            <h2 className="text-h2 text-text-primary mb-4">
              Instellingen
            </h2>
          </div>
          
          <div className="space-y-8">
            <div className="card-section">
              <h3 className="text-xl font-semibold text-text-primary mb-4">Account</h3>
              <div className="space-y-3">
                <Button variant="outline" size="sm" fullWidth className="text-text-primary border border-light-grey hover:bg-light-grey">
                  Wachtwoord wijzigen
                </Button>
                <Button variant="outline" size="sm" fullWidth className="text-text-primary border border-light-grey hover:bg-light-grey">
                  E-mailadres bijwerken
                </Button>
                <Button variant="outline" size="sm" fullWidth className="text-text-primary border border-light-grey hover:bg-light-grey">
                  Profiel bewerken
                </Button>
              </div>
            </div>
            
            <div className="card-section">
              <h3 className="text-xl font-semibold text-text-primary mb-4">Privacy</h3>
              <div className="space-y-3">
                <Button variant="outline" size="sm" fullWidth className="text-text-primary border border-light-grey hover:bg-light-grey">
                  Privacyinstellingen
                </Button>
                <Button variant="outline" size="sm" fullWidth className="text-text-primary border border-light-grey hover:bg-light-grey">
                  Gegevens downloaden
                </Button>
                <Button variant="danger" size="sm" fullWidth>
                  Account verwijderen
                </Button>
              </div>
            </div>
            
            <div className="card-section">
              <h3 className="text-xl font-semibold text-text-primary mb-4">Abonnement</h3>
              {user.isPremium ? (
                <div className="space-y-3">
                  <div className="bg-turquoise/20 p-3 rounded-lg mb-3">
                    <p className="text-text-primary font-medium">Premium Abonnement Actief</p>
                    <p className="text-base text-text-secondary">Je hebt toegang tot alle premium functies</p>
                  </div>
                  <Button variant="outline" size="sm" fullWidth className="text-text-primary border border-light-grey hover:bg-light-grey">
                    Abonnement beheren
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-light-grey p-3 rounded-lg mb-3">
                    <p className="text-text-primary font-medium">Basis Abonnement</p>
                    <p className="text-base text-text-secondary">Upgrade naar Premium voor meer functies</p>
                  </div>
                  <Button variant="primary" size="sm" fullWidth>
                    Upgrade naar Premium
                  </Button>
                </div>
              )}
            </div>
            
            {/* Data source settings */}
            <div className="card-section">
              <h3 className="text-xl font-semibold text-text-primary mb-4">Databron</h3>
              <div className="space-y-3">
                <div className="bg-light-grey p-3 rounded-lg">
                  <p className="text-text-primary font-medium">Huidige databron</p>
                  <p className="text-base text-text-secondary flex items-center mt-1">
                    {dataSource === 'supabase' ? (
                      <>📦 Supabase</>
                    ) : dataSource === 'zalando' ? (
                      <>🛍️ Zalando</>
                    ) : (
                      <>🧪 Lokaal</>
                    )}
                  </p>
                </div>
                <p className="text-base text-text-secondary">
                  De databron wordt automatisch bepaald op basis van beschikbaarheid.
                  Supabase heeft de hoogste prioriteit, gevolgd door Zalando en lokale data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight to-midnight py-12">
      <div className="container-slim">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-h1 text-white font-bold mb-6">
            Welkom, {user.name.split(' ')[0]}
          </h1>
          <p className="text-base text-white/80 mb-4">
            Je hebt {points} punten • {level} niveau • {streak} dagen streak
          </p>
        </div>

        {/* Gamification Banner */}
        <GamificationBanner />

        {/* Tabs */}
        <div className="flex overflow-x-auto mb-10 pb-2 scrollbar-hide space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-full mr-2 transition-colors ${
              activeTab === 'overview'
                ? 'tab-active'
                : 'tab-inactive'
            }`}
          >
            Overzicht
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-full mr-2 transition-colors ${
              activeTab === 'profile'
                ? 'tab-active'
                : 'tab-inactive'
            }`}
          >
            Profiel
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-full mr-2 transition-colors ${
              activeTab === 'saved'
                ? 'tab-active'
                : 'tab-inactive'
            }`}
          >
            Opgeslagen
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-full transition-colors ${
              activeTab === 'settings'
                ? 'tab-active'
                : 'tab-inactive'
            }`}
          >
            Instellingen
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <DailyChallengeCard />
              <AchievementCard />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <LeaderboardCard />
              <ReferralWidget />
            </div>
          </div>
        )}

        {activeTab === 'profile' && <ProfileSection />}
        {activeTab === 'saved' && <SavedOutfitsSection />}
        {activeTab === 'settings' && <SettingsSection />}
      </div>
    </div>
  );
};

export default DashboardPage;