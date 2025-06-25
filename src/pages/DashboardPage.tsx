import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Heart, 
  Settings, 
  LogOut, 
  Edit,
  Clock,
  ShieldCheck,
  Shirt,
  MessageCircle,
  Award,
  Camera
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser, StylePreference } from '../context/UserContext';
import { useGamification } from '../context/GamificationContext';
import { motion } from 'framer-motion';

const DashboardPage: React.FC = () => {
  const location = useLocation();
  const { user, logout, updateProfile } = useUser();
  const { 
    points, 
    currentLevelInfo, 
    earnedBadges, 
    streak,
    getProgressToNextLevel,
    nextLevelInfo
  } = useGamification();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
            Log in om je dashboard te bekijken
          </h2>
          <Button as={Link} to="/onboarding" variant="primary">
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 py-8 transition-colors">
      <div className="container-slim">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden transition-colors">
              <div className="p-6 border-b dark:border-neutral-700 flex flex-col items-center">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center text-neutral-400 dark:text-neutral-500">
                    <User size={48} />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-primary-500 p-1.5 rounded-full text-white">
                    <Edit size={14} />
                  </button>
                </div>
                <h2 className="mt-4 text-xl font-bold text-neutral-900 dark:text-white">
                  {user.name}
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  {user.email}
                </p>
                
                {/* Gamification Status */}
                <div className="mt-4 w-full">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{currentLevelInfo?.icon || '🌱'}</span>
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {currentLevelInfo?.name || 'Beginner'}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-primary-500">
                      {points.toLocaleString()} pts
                    </span>
                  </div>
                  
                  {nextLevelInfo && (
                    <div>
                      <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                        <span>Voortgang naar {nextLevelInfo.name}</span>
                        <span>{Math.round(getProgressToNextLevel())}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1">
                        <div 
                          className="bg-primary-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressToNextLevel()}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {streak > 0 && (
                    <div className="mt-2 flex items-center justify-center space-x-1 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-full">
                      <span className="text-sm">🔥</span>
                      <span className="text-sm font-bold text-primary-500">{streak} dagen streak</span>
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  {user.isPremium ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                      Premium
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300">
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
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}
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
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}
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
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}
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
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}
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
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}
                      `}
                    >
                      <Settings size={18} className="mr-3" />
                      Instellingen
                    </Link>
                  </li>
                </ul>
              </nav>
              
              <div className="p-4 border-t dark:border-neutral-700">
                <Button
                  variant="secondary"
                  fullWidth
                  icon={<LogOut size={18} />}
                  iconPosition="left"
                  onClick={() => logout()}
                >
                  Uitloggen
                </Button>
              </div>
            </div>
            
            {!user.isPremium && (
              <div className="mt-6 bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-6 shadow-sm border border-primary-200 dark:border-primary-800">
                <h3 className="font-bold text-lg mb-2 text-neutral-900 dark:text-white">Upgrade naar Premium</h3>
                <p className="text-neutral-700 dark:text-neutral-300 text-sm mb-4">
                  Krijg onbeperkte outfit aanbevelingen, geavanceerde styling opties en exclusieve functies.
                </p>
                <Button 
                  variant="primary" 
                  fullWidth
                >
                  Nu Upgraden
                </Button>
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
  };

  const stylePreferences = user.stylePreferences;

  return (
    <div className="space-y-8">
      {/* My Closet Section */}
      <MyClosetSection />
      
      {/* Original Profile Section */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b dark:border-neutral-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Profiel
          </h2>
          <Button 
            variant="secondary" 
            size="sm"
            icon={isEditing ? <User size={16} /> : <Edit size={16} />}
            iconPosition="left"
            onClick={() => setIsEditing(!isEditing)}
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
                    variant="secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Annuleren
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">
                  Persoonlijke Informatie
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Naam</p>
                    <p className="text-neutral-900 dark:text-white font-medium">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">E-mail</p>
                    <p className="text-neutral-900 dark:text-white font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Lid Sinds</p>
                    <p className="text-neutral-900 dark:text-white font-medium">April 2025</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Abonnement</p>
                    <p className="text-neutral-900 dark:text-white font-medium">
                      {user.isPremium ? 'Premium' : 'Gratis'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t dark:border-neutral-700">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">
                  Stijlvoorkeuren
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(stylePreferences).map(([style, value]) => (
                    <div key={style} className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-900 dark:text-white font-medium capitalize">
                          {style}
                        </span>
                        <span className="text-primary-500 font-bold">{value}/5</span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-1">
                        <div 
                          className="bg-primary-500 h-1 rounded-full" 
                          style={{ width: `${(Number(value) / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Button variant="secondary" size="sm">
                    Stijlquiz Opnieuw Doen
                  </Button>
                </div>
              </div>
              
              <div className="pt-6 border-t dark:border-neutral-700">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">
                  Jouw Foto's
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <div className="aspect-square bg-neutral-100 dark:bg-neutral-700 rounded-lg flex items-center justify-center text-neutral-400 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">
                    <div className="text-center p-4">
                      <Camera size={24} className="mx-auto mb-2" />
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">Foto Uploaden</span>
                    </div>
                  </div>
                  
                  {/* This would be populated with user photos in a real app */}
                  <div className="aspect-square bg-neutral-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center text-neutral-500">
                    Nog geen foto's
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
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden transition-colors mb-8">
      <div className="px-6 py-4 border-b dark:border-neutral-700 flex justify-between items-center">
        <div className="flex items-center">
          <Shirt className="text-primary-500 mr-3" size={24} />
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Mijn Kledingkast
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {closetItems.length} outfits in je collectie
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm">
          <Camera size={16} className="mr-2" />
          Outfit Toevoegen
        </Button>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {closetItems.map(item => (
            <motion.div 
              key={item.id} 
              className="group cursor-pointer"
              whileHover={{ y: -5 }}
            >
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-700 mb-3 hover:shadow-lg transition-all duration-300">
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
                  <button className="bg-white/90 dark:bg-neutral-800/90 p-1.5 rounded-full hover:bg-white dark:hover:bg-neutral-800 transition-colors">
                    <Heart size={14} className="text-neutral-600 dark:text-neutral-300" />
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
                <div className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                  {item.category}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {item.lastWorn}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <Button variant="secondary">
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
      savedDate: '2025-04-15'
    },
    {
      id: '2',
      title: 'Weekend Casual Ensemble',
      imageUrl: 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      savedDate: '2025-04-10'
    }
  ];

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden transition-colors">
      <div className="px-6 py-4 border-b dark:border-neutral-700">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          Opgeslagen Outfits
        </h2>
      </div>
      
      <div className="p-6">
        {savedOutfits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {savedOutfits.map(outfit => (
              <motion.div 
                key={outfit.id} 
                className="border dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
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
                  <button className="absolute top-2 right-2 p-1.5 bg-white dark:bg-neutral-800 rounded-full shadow-sm">
                    <Heart className="text-red-500" size={16} />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-neutral-900 dark:text-white">{outfit.title}</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                    Opgeslagen op {new Date(outfit.savedDate).toLocaleDateString()}
                  </p>
                  <div className="mt-3">
                    <Link to={`/recommendations?id=${outfit.id}`} className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                      Details Bekijken
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Heart className="mx-auto text-neutral-400" size={48} />
            <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">
              Nog geen opgeslagen outfits
            </h3>
            <p className="mt-1 text-neutral-500 dark:text-neutral-400">
              Begin met het opslaan van outfits die je leuk vindt voor later.
            </p>
            <div className="mt-4">
              <Button 
                as={Link} 
                to="/recommendations" 
                variant="primary"
              >
                Aanbevelingen Bekijken
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HistorySection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden transition-colors">
      <div className="px-6 py-4 border-b dark:border-neutral-700">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          Activiteitengeschiedenis
        </h2>
      </div>
      
      <div className="p-6">
        <div className="space-y-8">
          <div className="border-l-2 border-primary-500 pl-4 relative">
            <div className="absolute w-3 h-3 rounded-full bg-primary-500 -left-[6.5px] top-1"></div>
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-neutral-900 dark:text-white">Stijlvragenlijst Voltooid</h3>
                <span className="text-neutral-500 dark:text-neutral-400 text-sm">15 april 2025</span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
                Je hebt je persoonlijke stijlvragenlijst voltooid.
              </p>
            </div>
          </div>
          
          <div className="border-l-2 border-primary-500 pl-4 relative">
            <div className="absolute w-3 h-3 rounded-full bg-primary-500 -left-[6.5px] top-1"></div>
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-neutral-900 dark:text-white">Eerste Foto Geüpload</h3>
                <span className="text-neutral-500 dark:text-neutral-400 text-sm">15 april 2025</span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
                Je hebt je eerste foto geüpload voor stijlanalyse.
              </p>
            </div>
          </div>
          
          <div className="border-l-2 border-primary-500 pl-4 relative">
            <div className="absolute w-3 h-3 rounded-full bg-primary-500 -left-[6.5px] top-1"></div>
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-neutral-900 dark:text-white">Aanbevelingen Ontvangen</h3>
                <span className="text-neutral-500 dark:text-neutral-400 text-sm">15 april 2025</span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
                Je hebt je eerste set gepersonaliseerde stijlaanbevelingen ontvangen.
              </p>
              <div className="mt-2">
                <Button 
                  as={Link} 
                  to="/recommendations" 
                  variant="secondary" 
                  size="sm"
                >
                  Aanbevelingen Bekijken
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-l-2 border-primary-500 pl-4 relative">
            <div className="absolute w-3 h-3 rounded-full bg-primary-500 -left-[6.5px] top-1"></div>
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-neutral-900 dark:text-white">Eerste Outfit Opgeslagen</h3>
                <span className="text-neutral-500 dark:text-neutral-400 text-sm">15 april 2025</span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
                Je hebt "Smart Casual Kantoor Look" opgeslagen in je favorieten.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PrivacySection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden transition-colors">
      <div className="px-6 py-4 border-b dark:border-neutral-700">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          Privacy & Gegevens
        </h2>
      </div>
      
      <div className="p-6">
        <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl mb-6">
          <div className="flex items-start">
            <ShieldCheck className="text-primary-500 mr-3 mt-0.5" size={20} />
            <div>
              <h3 className="font-medium text-neutral-900 dark:text-white">Je Gegevens zijn Beschermd</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
                FitFi gebruikt end-to-end encryptie om je foto's en persoonlijke informatie te beschermen.
                Je gegevens worden nooit gedeeld met derden zonder je expliciete toestemming.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-3">
              Gegevensvoorkeuren
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-white">Foto-opslag</h4>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                    Sta FitFi toe om je foto's op te slaan voor toekomstige aanbevelingen
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input type="checkbox" id="toggle-photos" className="sr-only peer" defaultChecked />
                  <label
                    htmlFor="toggle-photos"
                    className="absolute cursor-pointer bg-neutral-300 dark:bg-neutral-600 peer-checked:bg-primary-500 rounded-full h-6 w-12 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-white">Stijlvoorkeuren</h4>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                    Sla stijlvoorkeuren op om aanbevelingen te verbeteren
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input type="checkbox" id="toggle-style" className="sr-only peer" defaultChecked />
                  <label
                    htmlFor="toggle-style"
                    className="absolute cursor-pointer bg-neutral-300 dark:bg-neutral-600 peer-checked:bg-primary-500 rounded-full h-6 w-12 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-white">Gebruiksanalyse</h4>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                    Deel anonieme gebruiksgegevens om onze service te verbeteren
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input type="checkbox" id="toggle-analytics" className="sr-only peer" defaultChecked />
                  <label
                    htmlFor="toggle-analytics"
                    className="absolute cursor-pointer bg-neutral-300 dark:bg-neutral-600 peer-checked:bg-primary-500 rounded-full h-6 w-12 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  ></label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t dark:border-neutral-700">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-3">
              Communicatie
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-white">E-mailnotificaties</h4>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                    Ontvang updates over nieuwe stijlaanbevelingen
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input type="checkbox" id="toggle-email" className="sr-only peer" defaultChecked />
                  <label
                    htmlFor="toggle-email"
                    className="absolute cursor-pointer bg-neutral-300 dark:bg-neutral-600 peer-checked:bg-primary-500 rounded-full h-6 w-12 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-white">Marketing E-mails</h4>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                    Ontvang promotionele aanbiedingen en nieuwsbrieven
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input type="checkbox" id="toggle-marketing" className="sr-only peer" />
                  <label
                    htmlFor="toggle-marketing"
                    className="absolute cursor-pointer bg-neutral-300 dark:bg-neutral-600 peer-checked:bg-primary-500 rounded-full h-6 w-12 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  ></label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t dark:border-neutral-700">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-3">
              Gegevensbeheer
            </h3>
            
            <div className="space-y-4">
              <Button 
                variant="secondary" 
                icon={<Award size={16} />}
                iconPosition="left"
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
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden transition-colors">
      <div className="px-6 py-4 border-b dark:border-neutral-700">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          Accountinstellingen
        </h2>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">
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
          
          <div className="pt-6 border-t dark:border-neutral-700">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">
              Abonnement
            </h3>
            
            <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-white">Huidig Abonnement</h4>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
                    Gratis Abonnement
                  </p>
                </div>
                <Button variant="primary" size="sm">
                  Upgraden
                </Button>
              </div>
            </div>
            
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              Upgrade naar Premium voor onbeperkte outfit aanbevelingen, geavanceerde styling functies en meer.
            </p>
          </div>
          
          <div className="pt-6 border-t dark:border-neutral-700">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">
              Weergavevoorkeuren
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-white">Eenheden</h4>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                    Maateenheden voor kledingmaten
                  </p>
                </div>
                <select className="input w-40">
                  <option>Metrisch (cm)</option>
                  <option>Imperiaal (inches)</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-white">Valuta</h4>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                    Toon prijzen in je voorkeursmunt
                  </p>
                </div>
                <select className="input w-40">
                  <option>EUR (€)</option>
                  <option>USD ($)</option>
                  <option>GBP (£)</option>
                  <option>JPY (¥)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t dark:border-neutral-700">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">
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