import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Heart, 
  Settings, 
  Camera, 
  LogOut, 
  Edit,
  Clock,
  ShieldCheck,
  Download,
  Shirt,
  Users,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Eye,
  TrendingUp,
  Award,
  Zap,
  Gift,
  Bell,
  Calendar,
  BarChart2,
  Layers,
  PlusCircle,
  RefreshCw,
  ChevronRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser, StylePreference } from '../context/UserContext';
import { useGamification } from '../context/GamificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import AchievementCard from '../components/ui/AchievementCard';
import DailyChallengeCard from '../components/ui/DailyChallengeCard';
import LeaderboardCard from '../components/ui/LeaderboardCard';
import ReferralWidget from '../components/ui/ReferralWidget';
import GamificationBanner from '../components/ui/GamificationBanner';
import RecommendationCard from '../components/ui/RecommendationCard';

const DashboardPage: React.FC = () => {
  const location = useLocation();
  const { user, logout, updateProfile } = useUser();
  const { 
    points, 
    currentLevelInfo, 
    earnedBadges, 
    streak,
    getProgressToNextLevel,
    nextLevelInfo,
    checkIn,
    isSeasonalEventActive
  } = useGamification();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Nieuwe stijlaanbevelingen',
      message: 'We hebben nieuwe outfits voor je geselecteerd op basis van je voorkeuren.',
      time: '2 uur geleden',
      read: false,
      type: 'recommendation'
    },
    {
      id: 2,
      title: 'Seizoensupdate: Zomercollectie',
      message: 'Ontdek de nieuwste zomertrends die bij jouw stijlprofiel passen.',
      time: '1 dag geleden',
      read: true,
      type: 'seasonal'
    }
  ]);
  
  const unreadNotifications = notifications.filter(n => !n.read).length;
  
  const handleDailyCheckIn = async () => {
    try {
      await checkIn();
      toast.success('Dagelijkse check-in voltooid! +10 punten');
    } catch (error) {
      console.error('Check-in failed:', error);
      toast.error('Check-in mislukt. Probeer het later opnieuw.');
    }
  };
  
  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B] flex items-center justify-center">
        <div className="glass-card p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-[#FF8600]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="text-[#FF8600]" size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-4">
            Log in om je dashboard te bekijken
          </h2>
          <p className="text-white/80 mb-6">
            Je moet ingelogd zijn om je persoonlijke dashboard te bekijken en je stijlvoorkeuren te beheren.
          </p>
          <Button as={Link} to="/onboarding" variant="primary">
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B] py-8">
      <div className="container-slim">
        {/* Welcome Banner */}
        <div className="mb-8">
          <motion.div 
            className="glass-card p-6 border border-[#FF8600]/20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl font-bold text-white mb-2">
                  Welkom terug, {user.name.split(' ')[0]}!
                </h1>
                <p className="text-white/80">
                  {isSeasonalEventActive() ? 
                    'Winter Fashion Week is actief! Verdien dubbele punten op alle activiteiten.' : 
                    'Wat wil je vandaag ontdekken?'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <span className="text-lg">{currentLevelInfo?.icon || '🌱'}</span>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {points.toLocaleString()} punten
                    </div>
                    <div className="text-xs text-white/70">
                      {currentLevelInfo?.name || 'Beginner'} niveau
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <button 
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors relative"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell size={20} className="text-white" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF8600] text-white text-xs rounded-full flex items-center justify-center">
                        {unreadNotifications}
                      </span>
                    )}
                  </button>
                  
                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div 
                        className="absolute right-0 mt-2 w-80 glass-card border border-white/10 shadow-lg z-50"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-3 border-b border-white/10 flex justify-between items-center">
                          <h3 className="font-medium text-white">Notificaties</h3>
                          <button 
                            className="text-xs text-[#FF8600] hover:text-orange-400 transition-colors"
                            onClick={markAllNotificationsAsRead}
                          >
                            Alles als gelezen markeren
                          </button>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length > 0 ? (
                            <div>
                              {notifications.map(notification => (
                                <div 
                                  key={notification.id} 
                                  className={`p-3 border-b border-white/10 hover:bg-white/5 transition-colors ${notification.read ? 'opacity-70' : ''}`}
                                >
                                  <div className="flex items-start">
                                    <div className={`p-2 rounded-full mr-3 ${
                                      notification.type === 'recommendation' ? 'bg-[#0ea5e9]/20 text-[#0ea5e9]' : 
                                      notification.type === 'seasonal' ? 'bg-[#FF8600]/20 text-[#FF8600]' : 
                                      'bg-white/20 text-white'
                                    }`}>
                                      {notification.type === 'recommendation' ? <Sparkles size={16} /> : 
                                       notification.type === 'seasonal' ? <Calendar size={16} /> : 
                                       <Bell size={16} />}
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="text-sm font-medium text-white mb-1">
                                        {notification.title}
                                        {!notification.read && (
                                          <span className="ml-2 inline-block w-2 h-2 bg-[#FF8600] rounded-full"></span>
                                        )}
                                      </h4>
                                      <p className="text-xs text-white/70 mb-1">{notification.message}</p>
                                      <p className="text-xs text-white/50">{notification.time}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-white/50 text-sm">
                              Geen notificaties
                            </div>
                          )}
                        </div>
                        <div className="p-3 border-t border-white/10 text-center">
                          <button className="text-xs text-[#0ea5e9] hover:text-blue-400 transition-colors">
                            Alle notificaties bekijken
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {streak > 0 && (
                  <div className="flex items-center space-x-1 bg-[#FF8600]/20 px-2 py-1 rounded-full">
                    <span className="text-sm">🔥</span>
                    <span className="text-sm font-bold text-[#FF8600]">{streak}</span>
                  </div>
                )}
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDailyCheckIn}
                  icon={<Zap size={14} />}
                  iconPosition="left"
                >
                  Check in
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="glass-card overflow-hidden mb-6">
              <div className="p-6 border-b border-white/10 flex flex-col items-center">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-white/10 flex items-center justify-center text-white/50">
                    <User size={48} />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-[#FF8600] p-1.5 rounded-full text-white">
                    <Edit size={14} />
                  </button>
                </div>
                <h2 className="mt-4 text-xl font-bold text-white">
                  {user.name}
                </h2>
                <p className="text-white/70 text-sm">
                  {user.email}
                </p>
                
                {/* Gamification Status */}
                <div className="mt-4 w-full">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{currentLevelInfo?.icon || '🌱'}</span>
                      <span className="text-sm font-medium text-white/90">
                        {currentLevelInfo?.name || 'Beginner'}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#FF8600]">
                      {points.toLocaleString()} pts
                    </span>
                  </div>
                  
                  {nextLevelInfo && (
                    <div>
                      <div className="flex justify-between text-xs text-white/60 mb-1">
                        <span>Voortgang naar {nextLevelInfo.name}</span>
                        <span>{Math.round(getProgressToNextLevel())}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1">
                        <div 
                          className="bg-[#FF8600] h-1 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressToNextLevel()}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  {user.isPremium ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FF8600]/20 text-[#FF8600]">
                      Premium
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/80">
                      Gratis
                    </span>
                  )}
                </div>
              </div>
              
              <nav className="p-4">
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/dashboard"
                      className={`
                        flex items-center px-4 py-2 rounded-lg transition-colors
                        ${location.pathname === '/dashboard' 
                          ? 'bg-[#FF8600]/20 text-[#FF8600]' 
                          : 'text-white/80 hover:bg-white/10 hover:text-white'}
                      `}
                    >
                      <User size={18} className="mr-3" />
                      Profiel
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/saved"
                      className={`
                        flex items-center px-4 py-2 rounded-lg transition-colors
                        ${location.pathname === '/dashboard/saved' 
                          ? 'bg-[#FF8600]/20 text-[#FF8600]' 
                          : 'text-white/80 hover:bg-white/10 hover:text-white'}
                      `}
                    >
                      <Heart size={18} className="mr-3" />
                      Opgeslagen Outfits
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/history"
                      className={`
                        flex items-center px-4 py-2 rounded-lg transition-colors
                        ${location.pathname === '/dashboard/history' 
                          ? 'bg-[#FF8600]/20 text-[#FF8600]' 
                          : 'text-white/80 hover:bg-white/10 hover:text-white'}
                      `}
                    >
                      <Clock size={18} className="mr-3" />
                      Geschiedenis
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/privacy"
                      className={`
                        flex items-center px-4 py-2 rounded-lg transition-colors
                        ${location.pathname === '/dashboard/privacy' 
                          ? 'bg-[#FF8600]/20 text-[#FF8600]' 
                          : 'text-white/80 hover:bg-white/10 hover:text-white'}
                      `}
                    >
                      <ShieldCheck size={18} className="mr-3" />
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/settings"
                      className={`
                        flex items-center px-4 py-2 rounded-lg transition-colors
                        ${location.pathname === '/dashboard/settings' 
                          ? 'bg-[#FF8600]/20 text-[#FF8600]' 
                          : 'text-white/80 hover:bg-white/10 hover:text-white'}
                      `}
                    >
                      <Settings size={18} className="mr-3" />
                      Instellingen
                    </Link>
                  </li>
                </ul>
              </nav>
              
              <div className="p-4 border-t border-white/10">
                <Button
                  variant="ghost"
                  fullWidth
                  icon={<LogOut size={18} />}
                  iconPosition="left"
                  onClick={() => logout()}
                  className="text-white border border-white/20 hover:bg-white/10"
                >
                  Uitloggen
                </Button>
              </div>
            </div>
            
            {!user.isPremium && (
              <div className="glass-card p-6 border border-[#FF8600]/20 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 rounded-full bg-[#FF8600]/20">
                    <Sparkles className="text-[#FF8600]" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Upgrade naar Premium</h3>
                    <p className="text-xs text-white/70">Ontgrendel alle functies</p>
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <CheckCircle className="text-[#FF8600] mr-2 mt-0.5 flex-shrink-0" size={16} />
                    <span className="text-sm text-white/80">Onbeperkte outfit aanbevelingen</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-[#FF8600] mr-2 mt-0.5 flex-shrink-0" size={16} />
                    <span className="text-sm text-white/80">Seizoensgebonden updates</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-[#FF8600] mr-2 mt-0.5 flex-shrink-0" size={16} />
                    <span className="text-sm text-white/80">Exclusieve stijltips & content</span>
                  </li>
                </ul>
                <Button 
                  variant="primary" 
                  fullWidth
                >
                  Upgrade voor €12,99/mnd
                </Button>
              </div>
            )}
            
            {/* Quick Stats */}
            <div className="glass-card p-6 mb-6">
              <h3 className="font-bold text-white mb-4">Jouw Statistieken</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-[#FF8600]">12</div>
                  <div className="text-xs text-white/70">Opgeslagen outfits</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-[#0ea5e9]">24</div>
                  <div className="text-xs text-white/70">Bekeken items</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-[#FF8600]">3</div>
                  <div className="text-xs text-white/70">Aankopen</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-[#0ea5e9]">85%</div>
                  <div className="text-xs text-white/70">Stijlmatch</div>
                </div>
              </div>
            </div>
            
            {/* Seasonal Event Banner */}
            {isSeasonalEventActive() && (
              <div className="glass-card p-4 border border-[#0ea5e9]/20 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-[#0ea5e9]/20">
                    <Calendar className="text-[#0ea5e9]" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Winter Fashion Week</h3>
                    <p className="text-xs text-white/70">Verdien 2x punten tot 31 jan</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Main content */}
          <div className="lg:w-3/4">
            <Routes>
              <Route path="/" element={<ProfileSection user={user} updateProfile={updateProfile} />} />
              <Route path="/saved" element={<SavedOutfitsSection />} />
              <Route path="/history" element={<HistorySection />} />
              <Route path="/privacy" element={<PrivacySection />} />
              <Route path="/settings" element={<SettingsSection />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProfileSectionProps {
  user: any;
  updateProfile: (updates: Partial<any>) => Promise<void>;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ user, updateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email
  });
  
  // Recommended products based on user style
  const recommendedProducts = [
    {
      id: 'rec_001',
      name: 'Premium Wool Coat',
      brand: 'Mango',
      retailer: 'Zalando',
      productId: 'mng12345',
      price: 129.99,
      category: 'Jassen',
      imageUrl: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      url: 'https://www.zalando.nl/mango-classic-coat-mantel-classic-m9121u1aq-q11.html'
    },
    {
      id: 'rec_002',
      name: 'Slim Fit Chinos',
      brand: 'Selected Homme',
      retailer: 'H&M NL',
      productId: 'slh67890',
      price: 59.99,
      category: 'Broeken',
      imageUrl: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      url: 'https://www2.hm.com/nl_nl/productpage.1074402001.html'
    },
    {
      id: 'rec_003',
      name: 'Leather Chelsea Boots',
      brand: 'Dr. Martens',
      retailer: 'Zalando',
      productId: 'dm54321',
      price: 189.99,
      category: 'Schoenen',
      imageUrl: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      url: 'https://www.zalando.nl/dr-martens-chelsea-boots-black-do215n00b-q11.html'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
    setIsEditing(false);
    toast.success('Profiel bijgewerkt!');
  };

  const stylePreferences = user.stylePreferences;

  return (
    <div className="space-y-8">
      {/* Gamification Banner */}
      <GamificationBanner />
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          className="glass-card p-4 border border-[#FF8600]/20 hover:border-[#FF8600]/50 transition-all cursor-pointer"
          whileHover={{ y: -5 }}
          onClick={() => window.location.href = '/quiz/1'}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-[#FF8600]/20">
              <RefreshCw className="text-[#FF8600]" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white">Stijlquiz opnieuw doen</h3>
              <p className="text-xs text-white/70">Update je stijlvoorkeuren</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="glass-card p-4 border border-[#0ea5e9]/20 hover:border-[#0ea5e9]/50 transition-all cursor-pointer"
          whileHover={{ y: -5 }}
          onClick={() => window.location.href = '/results'}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-[#0ea5e9]/20">
              <Sparkles className="text-[#0ea5e9]" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white">Nieuwe aanbevelingen</h3>
              <p className="text-xs text-white/70">Ontdek je nieuwste outfits</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="glass-card p-4 border border-[#FF8600]/20 hover:border-[#FF8600]/50 transition-all cursor-pointer"
          whileHover={{ y: -5 }}
          onClick={() => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              if (target.files && target.files[0]) {
                toast.success('Foto geüpload! Nieuwe aanbevelingen worden gegenereerd.');
              }
            };
            fileInput.click();
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-[#FF8600]/20">
              <Camera className="text-[#FF8600]" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white">Upload nieuwe foto</h3>
              <p className="text-xs text-white/70">Voor betere aanbevelingen</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Style Insights & Recommendations */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center">
            <Sparkles className="text-[#FF8600] mr-3" size={20} />
            <h2 className="text-xl font-bold text-white">
              Jouw Stijlprofiel
            </h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white border border-white/20 hover:bg-white/10"
          >
            Details bekijken
          </Button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">
                Jouw Stijlvoorkeuren
              </h3>
              <div className="space-y-4">
                {Object.entries(stylePreferences).map(([style, value]) => (
                  <div key={style}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white/90 font-medium capitalize">
                        {style}
                      </span>
                      <span className="text-[#FF8600] font-bold">{value}/5</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div 
                        className="bg-[#FF8600] h-1.5 rounded-full" 
                        style={{ width: `${(Number(value) / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-4">
                Stijlkenmerken
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="text-sm font-medium text-white mb-1">Kleurenpalet</div>
                  <div className="text-white/70 text-sm">Neutrale tinten met warme accenten</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="text-sm font-medium text-white mb-1">Silhouet</div>
                  <div className="text-white/70 text-sm">Slim fit met gestructureerde lijnen</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="text-sm font-medium text-white mb-1">Texturen</div>
                  <div className="text-white/70 text-sm">Voorkeur voor natuurlijke materialen</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="text-sm font-medium text-white mb-1">Accessoires</div>
                  <div className="text-white/70 text-sm">Minimalistisch met focus op kwaliteit</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <Sparkles className="text-[#FF8600] mr-2" size={18} />
              Aanbevolen voor jou
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedProducts.map(product => (
                <RecommendationCard key={product.id} item={product} />
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <Button 
                as={Link}
                to="/results"
                variant="secondary"
                icon={<ChevronRight size={16} />}
                iconPosition="right"
              >
                Bekijk alle aanbevelingen
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gamification & Engagement Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AchievementCard />
        <DailyChallengeCard />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeaderboardCard />
        <ReferralWidget />
      </div>

      {/* My Closet Section */}
      <MyClosetSection />
      
      {/* Original Profile Section */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            Profiel Instellingen
          </h2>
          <Button 
            variant="ghost" 
            size="sm"
            icon={isEditing ? <User size={16} /> : <Edit size={16} />}
            iconPosition="left"
            onClick={() => setIsEditing(!isEditing)}
            className="text-white border border-white/20 hover:bg-white/10"
          >
            {isEditing ? 'Annuleren' : 'Profiel Bewerken'}
          </Button>
        </div>
        
        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="label">
                    Volledige Naam
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">
                    E-mailadres
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button 
                    type="submit" 
                    variant="primary"
                  >
                    Wijzigingen Opslaan
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    className="text-white border border-white/20 hover:bg-white/10"
                  >
                    Annuleren
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  Persoonlijke Informatie
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-sm text-white/70 mb-1">Naam</p>
                    <p className="text-white font-medium">{user.name}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-sm text-white/70 mb-1">E-mail</p>
                    <p className="text-white font-medium">{user.email}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-sm text-white/70 mb-1">Lid Sinds</p>
                    <p className="text-white font-medium">April 2025</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-sm text-white/70 mb-1">Abonnement</p>
                    <p className="text-white font-medium">
                      {user.isPremium ? 'Premium' : 'Gratis'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-lg font-medium text-white mb-4">
                  Jouw Foto's
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <motion.div 
                    className="aspect-square bg-white/5 rounded-lg flex items-center justify-center text-white/50 cursor-pointer hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      const fileInput = document.createElement('input');
                      fileInput.type = 'file';
                      fileInput.accept = 'image/*';
                      fileInput.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.files && target.files[0]) {
                          toast.success('Foto geüpload! Nieuwe aanbevelingen worden gegenereerd.');
                        }
                      };
                      fileInput.click();
                    }}
                  >
                    <div className="text-center p-4">
                      <Camera size={24} className="mx-auto mb-2" />
                      <span className="text-xs text-white/70">Foto Uploaden</span>
                    </div>
                  </motion.div>
                  
                  {/* This would be populated with user photos in a real app */}
                  <div className="aspect-square bg-white/5 rounded-lg flex items-center justify-center text-white/50">
                    <span className="text-sm">Nog geen foto's</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// My Closet Component
const MyClosetSection: React.FC = () => {
  const closetItems = [
    {
      id: '1',
      name: 'Smart Casual Kantoor Look',
      imageUrl: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      category: 'Werk',
      lastWorn: '2 dagen geleden',
      wornCount: 5
    },
    {
      id: '2',
      name: 'Weekend Casual Ensemble',
      imageUrl: 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      category: 'Casual',
      lastWorn: '1 week geleden',
      wornCount: 8
    },
    {
      id: '3',
      name: 'Avond Diner Outfit',
      imageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      category: 'Formeel',
      lastWorn: '3 weken geleden',
      wornCount: 2
    },
    {
      id: '4',
      name: 'Zomer Streetwear',
      imageUrl: 'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      category: 'Street',
      lastWorn: '5 dagen geleden',
      wornCount: 12
    },
    {
      id: '5',
      name: 'Minimalistische Chic',
      imageUrl: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      category: 'Minimaal',
      lastWorn: '1 dag geleden',
      wornCount: 15
    },
    {
      id: '6',
      name: 'Bohemian Vibes',
      imageUrl: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      category: 'Boho',
      lastWorn: '2 weken geleden',
      wornCount: 3
    }
  ];

  return (
    <div className="glass-card overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center">
          <Shirt className="text-[#FF8600] mr-3" size={24} />
          <div>
            <h2 className="text-xl font-bold text-white">
              Mijn Kledingkast
            </h2>
            <p className="text-sm text-white/70">
              {closetItems.length} outfits in je collectie
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          icon={<PlusCircle size={16} />}
          iconPosition="left"
          className="text-white border border-white/20 hover:bg-white/10"
        >
          Outfit Toevoegen
        </Button>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {closetItems.map(item => (
            <motion.div 
              key={item.id} 
              className="group cursor-pointer"
              whileHover={{ y: -5 }}
            >
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-white/5 mb-3 hover:shadow-lg transition-all duration-300">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => { 
                    e.currentTarget.onerror = null; 
                    e.currentTarget.src = '/placeholder.png'; 
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="bg-[#0D1B2A]/90 p-1.5 rounded-full hover:bg-[#0D1B2A] transition-colors">
                    <Heart size={14} className="text-white" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-white text-xs">
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-white/80">{item.wornCount}x gedragen</div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-white truncate">
                  {item.category}
                </div>
                <div className="text-xs text-white/60">
                  {item.lastWorn}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <Button 
            variant="ghost"
            className="text-white border border-white/20 hover:bg-white/10"
          >
            Bekijk Alle Outfits
          </Button>
        </div>
      </div>
    </div>
  );
};

const SavedOutfitsSection: React.FC = () => {
  // Mock data
  const savedOutfits = [
    {
      id: '1',
      title: 'Smart Casual Kantoor Look',
      imageUrl: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      savedDate: '2025-04-15',
      matchPercentage: 92,
      items: 4,
      totalPrice: 349.95
    },
    {
      id: '2',
      title: 'Weekend Casual Ensemble',
      imageUrl: 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      savedDate: '2025-04-10',
      matchPercentage: 88,
      items: 3,
      totalPrice: 219.99
    },
    {
      id: '3',
      title: 'Avond Diner Outfit',
      imageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      savedDate: '2025-04-05',
      matchPercentage: 95,
      items: 5,
      totalPrice: 499.95
    },
    {
      id: '4',
      title: 'Zomer Streetwear',
      imageUrl: 'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      savedDate: '2025-04-01',
      matchPercentage: 90,
      items: 4,
      totalPrice: 289.99
    }
  ];

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center">
          <Heart className="text-[#FF8600] mr-3" size={24} />
          <h2 className="text-xl font-bold text-white">
            Opgeslagen Outfits
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <select className="bg-white/5 border border-white/20 text-white/90 text-sm rounded-lg p-2 focus:ring-[#FF8600] focus:border-[#FF8600]">
            <option>Alle categorieën</option>
            <option>Werk</option>
            <option>Casual</option>
            <option>Formeel</option>
          </select>
          <Button 
            variant="ghost" 
            size="sm"
            icon={<Layers size={16} />}
            iconPosition="left"
            className="text-white border border-white/20 hover:bg-white/10"
          >
            Sorteren
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        {savedOutfits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedOutfits.map(outfit => (
              <motion.div 
                key={outfit.id} 
                className="glass-card overflow-hidden border border-white/10 hover:border-[#FF8600]/50 transition-all"
                whileHover={{ y: -5 }}
              >
                <div className="relative">
                  <img 
                    src={outfit.imageUrl} 
                    alt={outfit.title} 
                    className="w-full h-48 object-cover"
                    onError={(e) => { 
                      e.currentTarget.onerror = null; 
                      e.currentTarget.src = '/placeholder.png'; 
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-[#0D1B2A]/90 text-[#FF8600] px-2 py-1 rounded-full text-xs font-bold">
                    {outfit.matchPercentage}% Match
                  </div>
                  <button className="absolute top-3 right-3 p-1.5 bg-[#0D1B2A]/90 rounded-full text-[#FF8600]">
                    <Heart size={16} fill="currentColor" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-white mb-1">{outfit.title}</h3>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-white/60 text-xs">
                      Opgeslagen op {new Date(outfit.savedDate).toLocaleDateString()}
                    </p>
                    <p className="text-white/60 text-xs">
                      {outfit.items} items
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-white">
                      €{outfit.totalPrice.toFixed(2)}
                    </p>
                    <Link to={`/recommendations?id=${outfit.id}`} className="text-[#0ea5e9] hover:text-blue-400 text-sm font-medium">
                      Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="text-white/30" size={32} />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Nog geen opgeslagen outfits
            </h3>
            <p className="text-white/70 mb-6">
              Begin met het opslaan van outfits die je leuk vindt voor later.
            </p>
            <Button 
              as={Link} 
              to="/results" 
              variant="primary"
            >
              Aanbevelingen Bekijken
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const HistorySection: React.FC = () => {
  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center">
          <Clock className="text-[#FF8600] mr-3" size={24} />
          <h2 className="text-xl font-bold text-white">
            Activiteitengeschiedenis
          </h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          icon={<BarChart2 size={16} />}
          iconPosition="left"
          className="text-white border border-white/20 hover:bg-white/10"
        >
          Statistieken
        </Button>
      </div>
      
      <div className="p-6">
        <div className="space-y-8">
          <div className="border-l-2 border-[#FF8600] pl-4 relative">
            <div className="absolute w-3 h-3 rounded-full bg-[#FF8600] -left-[6.5px] top-1"></div>
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-white">Stijlvragenlijst Voltooid</h3>
                <span className="text-white/60 text-sm">15 april 2025</span>
              </div>
              <p className="text-white/80 text-sm mt-1">
                Je hebt je persoonlijke stijlvragenlijst voltooid.
              </p>
              <div className="mt-2 flex space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80">
                  <Award size={12} className="mr-1 text-[#FF8600]" /> +50 punten
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80">
                  <Sparkles size={12} className="mr-1 text-[#0ea5e9]" /> Stijlprofiel ontgrendeld
                </span>
              </div>
            </div>
          </div>
          
          <div className="border-l-2 border-[#FF8600] pl-4 relative">
            <div className="absolute w-3 h-3 rounded-full bg-[#FF8600] -left-[6.5px] top-1"></div>
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-white">Eerste Foto Geüpload</h3>
                <span className="text-white/60 text-sm">15 april 2025</span>
              </div>
              <p className="text-white/80 text-sm mt-1">
                Je hebt je eerste foto geüpload voor stijlanalyse.
              </p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80">
                  <Award size={12} className="mr-1 text-[#FF8600]" /> +25 punten
                </span>
              </div>
            </div>
          </div>
          
          <div className="border-l-2 border-[#FF8600] pl-4 relative">
            <div className="absolute w-3 h-3 rounded-full bg-[#FF8600] -left-[6.5px] top-1"></div>
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-white">Aanbevelingen Ontvangen</h3>
                <span className="text-white/60 text-sm">15 april 2025</span>
              </div>
              <p className="text-white/80 text-sm mt-1">
                Je hebt je eerste set gepersonaliseerde stijlaanbevelingen ontvangen.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button 
                  as={Link} 
                  to="/results" 
                  variant="secondary" 
                  size="sm"
                >
                  Aanbevelingen Bekijken
                </Button>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80">
                  <Award size={12} className="mr-1 text-[#FF8600]" /> +15 punten
                </span>
              </div>
            </div>
          </div>
          
          <div className="border-l-2 border-[#FF8600] pl-4 relative">
            <div className="absolute w-3 h-3 rounded-full bg-[#FF8600] -left-[6.5px] top-1"></div>
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-white">Eerste Outfit Opgeslagen</h3>
                <span className="text-white/60 text-sm">15 april 2025</span>
              </div>
              <p className="text-white/80 text-sm mt-1">
                Je hebt "Smart Casual Kantoor Look" opgeslagen in je favorieten.
              </p>
              <div className="mt-2 flex space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80">
                  <Award size={12} className="mr-1 text-[#FF8600]" /> +10 punten
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80">
                  <Badge size={12} className="mr-1 text-[#0ea5e9]" /> Badge ontgrendeld
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Button 
            variant="ghost"
            className="text-white border border-white/20 hover:bg-white/10"
          >
            Bekijk Volledige Geschiedenis
          </Button>
        </div>
      </div>
    </div>
  );
};

const PrivacySection: React.FC = () => {
  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center">
        <ShieldCheck className="text-[#FF8600] mr-3" size={24} />
        <h2 className="text-xl font-bold text-white">
          Privacy & Gegevens
        </h2>
      </div>
      
      <div className="p-6">
        <div className="bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 p-4 rounded-xl mb-6">
          <div className="flex items-start">
            <ShieldCheck className="text-[#0ea5e9] mr-3 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-medium text-white">Je Gegevens zijn Beschermd</h3>
              <p className="text-white/80 text-sm mt-1">
                FitFi gebruikt end-to-end encryptie om je foto's en persoonlijke informatie te beschermen.
                Je gegevens worden nooit gedeeld met derden zonder je expliciete toestemming.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-3">
              Gegevensvoorkeuren
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <h4 className="font-medium text-white">Foto-opslag</h4>
                  <p className="text-white/70 text-sm">
                    Sta FitFi toe om je foto's op te slaan voor toekomstige aanbevelingen
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input type="checkbox" id="toggle-photos" className="sr-only peer" defaultChecked />
                  <label
                    htmlFor="toggle-photos"
                    className="absolute cursor-pointer bg-white/20 peer-checked:bg-[#FF8600] rounded-full h-6 w-12 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <h4 className="font-medium text-white">Stijlvoorkeuren</h4>
                  <p className="text-white/70 text-sm">
                    Sla stijlvoorkeuren op om aanbevelingen te verbeteren
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input type="checkbox" id="toggle-style" className="sr-only peer" defaultChecked />
                  <label
                    htmlFor="toggle-style"
                    className="absolute cursor-pointer bg-white/20 peer-checked:bg-[#FF8600] rounded-full h-6 w-12 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <h4 className="font-medium text-white">Gebruiksanalyse</h4>
                  <p className="text-white/70 text-sm">
                    Deel anonieme gebruiksgegevens om onze service te verbeteren
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input type="checkbox" id="toggle-analytics" className="sr-only peer" defaultChecked />
                  <label
                    htmlFor="toggle-analytics"
                    className="absolute cursor-pointer bg-white/20 peer-checked:bg-[#FF8600] rounded-full h-6 w-12 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  ></label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/10">
            <h3 className="text-lg font-medium text-white mb-3">
              Communicatie
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <h4 className="font-medium text-white">E-mailnotificaties</h4>
                  <p className="text-white/70 text-sm">
                    Ontvang updates over nieuwe stijlaanbevelingen
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input type="checkbox" id="toggle-email" className="sr-only peer" defaultChecked />
                  <label
                    htmlFor="toggle-email"
                    className="absolute cursor-pointer bg-white/20 peer-checked:bg-[#FF8600] rounded-full h-6 w-12 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <h4 className="font-medium text-white">Marketing E-mails</h4>
                  <p className="text-white/70 text-sm">
                    Ontvang promotionele aanbiedingen en nieuwsbrieven
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input type="checkbox" id="toggle-marketing" className="sr-only peer" />
                  <label
                    htmlFor="toggle-marketing"
                    className="absolute cursor-pointer bg-white/20 peer-checked:bg-[#FF8600] rounded-full h-6 w-12 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  ></label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/10">
            <h3 className="text-lg font-medium text-white mb-3">
              Gegevensbeheer
            </h3>
            
            <div className="space-y-4">
              <Button 
                variant="ghost" 
                icon={<Download size={16} />}
                iconPosition="left"
                className="text-white border border-white/20 hover:bg-white/10"
              >
                Download Mijn Gegevens
              </Button>
              
              <Button 
                variant="danger"
              >
                Verwijder Al Mijn Gegevens
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsSection: React.FC = () => {
  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center">
        <Settings className="text-[#FF8600] mr-3" size={24} />
        <h2 className="text-xl font-bold text-white">
          Accountinstellingen
        </h2>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-4">
              Wachtwoord
            </h3>
            
            <form className="space-y-4">
              <div>
                <label className="label">
                  Huidig Wachtwoord
                </label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label className="label">
                  Nieuw Wachtwoord
                </label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label className="label">
                  Bevestig Nieuw Wachtwoord
                </label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                />
              </div>
              
              <Button type="submit" variant="primary">
                Wachtwoord Bijwerken
              </Button>
            </form>
          </div>
          
          <div className="pt-6 border-t border-white/10">
            <h3 className="text-lg font-medium text-white mb-4">
              Abonnement
            </h3>
            
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-white">Huidig Abonnement</h4>
                  <p className="text-white/70 text-sm mt-1">
                    Gratis Abonnement
                  </p>
                </div>
                <Button variant="primary" size="sm">
                  Upgraden
                </Button>
              </div>
            </div>
            
            <p className="text-white/80 text-sm">
              Upgrade naar Premium voor onbeperkte outfit aanbevelingen, geavanceerde styling functies en meer.
            </p>
          </div>
          
          <div className="pt-6 border-t border-white/10">
            <h3 className="text-lg font-medium text-white mb-4">
              Weergavevoorkeuren
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <h4 className="font-medium text-white">Eenheden</h4>
                  <p className="text-white/70 text-sm">
                    Maateenheden voor kledingmaten
                  </p>
                </div>
                <select className="bg-white/10 border border-white/20 text-white rounded-lg p-2 focus:ring-[#FF8600] focus:border-[#FF8600]">
                  <option>Metrisch (cm)</option>
                  <option>Imperiaal (inches)</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <h4 className="font-medium text-white">Valuta</h4>
                  <p className="text-white/70 text-sm">
                    Toon prijzen in je voorkeursmunt
                  </p>
                </div>
                <select className="bg-white/10 border border-white/20 text-white rounded-lg p-2 focus:ring-[#FF8600] focus:border-[#FF8600]">
                  <option>EUR (€)</option>
                  <option>USD ($)</option>
                  <option>GBP (£)</option>
                  <option>JPY (¥)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/10">
            <h3 className="text-lg font-medium text-white mb-4">
              Accountbeheer
            </h3>
            
            <div className="space-y-3">
              <Button variant="danger">
                Account Deactiveren
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;