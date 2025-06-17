import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Heart, 
  Settings, 
  Camera, 
  LogOut, 
  Edit,
  Clock,
  ShieldCheck
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser, StylePreference } from '../context/UserContext';

const DashboardPage: React.FC = () => {
  const location = useLocation();
  const { user, logout, updateProfile } = useUser();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Please login to access your dashboard
          </h2>
          <Button as={Link} to="/onboarding" variant="primary">
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
              <div className="p-6 border-b dark:border-gray-700 flex flex-col items-center">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <User size={48} />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-orange-500 p-1.5 rounded-full text-white">
                    <Edit size={14} />
                  </button>
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                  {user.name}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {user.email}
                </p>
                <div className="mt-2">
                  {user.isPremium ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                      Premium
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                      Free
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
                        flex items-center px-4 py-2 rounded-md transition-colors
                        ${location.pathname === '/dashboard' 
                          ? 'bg-orange-50 dark:bg-gray-700 text-orange-600 dark:text-orange-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                      `}
                    >
                      <User size={18} className="mr-3" />
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/saved"
                      className={`
                        flex items-center px-4 py-2 rounded-md transition-colors
                        ${location.pathname === '/dashboard/saved' 
                          ? 'bg-orange-50 dark:bg-gray-700 text-orange-600 dark:text-orange-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                      `}
                    >
                      <Heart size={18} className="mr-3" />
                      Saved Outfits
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/history"
                      className={`
                        flex items-center px-4 py-2 rounded-md transition-colors
                        ${location.pathname === '/dashboard/history' 
                          ? 'bg-orange-50 dark:bg-gray-700 text-orange-600 dark:text-orange-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                      `}
                    >
                      <Clock size={18} className="mr-3" />
                      History
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/privacy"
                      className={`
                        flex items-center px-4 py-2 rounded-md transition-colors
                        ${location.pathname === '/dashboard/privacy' 
                          ? 'bg-orange-50 dark:bg-gray-700 text-orange-600 dark:text-orange-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
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
                        flex items-center px-4 py-2 rounded-md transition-colors
                        ${location.pathname === '/dashboard/settings' 
                          ? 'bg-orange-50 dark:bg-gray-700 text-orange-600 dark:text-orange-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                      `}
                    >
                      <Settings size={18} className="mr-3" />
                      Settings
                    </Link>
                  </li>
                </ul>
              </nav>
              
              <div className="p-4 border-t dark:border-gray-700">
                <Button
                  variant="outline"
                  fullWidth
                  icon={<LogOut size={18} />}
                  iconPosition="left"
                  onClick={() => logout()}
                >
                  Log Out
                </Button>
              </div>
            </div>
            
            {!user.isPremium && (
              <div className="mt-6 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-700 dark:to-orange-800 rounded-xl p-6 text-white shadow-md transition-colors">
                <h3 className="font-bold text-lg mb-2">Upgrade to Premium</h3>
                <p className="text-white/90 text-sm mb-4">
                  Get unlimited outfit recommendations, advanced styling options, and exclusive features.
                </p>
                <Button 
                  variant="secondary" 
                  fullWidth
                >
                  Upgrade Now
                </Button>
              </div>
            )}
          </div>
          
          {/* Main content */}
          <div className="md:w-3/4">
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
      <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Profile
        </h2>
        <Button 
          variant="outline" 
          size="sm"
          icon={isEditing ? <User size={16} /> : <Edit size={16} />}
          iconPosition="left"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>
      
      <div className="p-6">
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex space-x-3">
                <Button 
                  type="submit" 
                  variant="primary"
                >
                  Save Changes
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                  <p className="text-gray-900 dark:text-white font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                  <p className="text-gray-900 dark:text-white font-medium">April 2025</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user.isPremium ? 'Premium' : 'Free'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Style Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(stylePreferences).map(([style, value]) => (
                  <div key={style} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-900 dark:text-white font-medium capitalize">
                        {style}
                      </span>
                      <span className="text-orange-500 font-bold">{value}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${(Number(value) / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Button variant="outline" size="sm">
                  Retake Style Quiz
                </Button>
              </div>
            </div>
            
            <div className="pt-6 border-t dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Your Photos
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <div className="text-center p-4">
                    <Camera size={24} className="mx-auto mb-2" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Upload Photo</span>
                  </div>
                </div>
                
                {/* This would be populated with user photos in a real app */}
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500">
                  No photos yet
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SavedOutfitsSection: React.FC = () => {
  // Mock data
  const savedOutfits = [
    {
      id: '1',
      title: 'Smart Casual Office Look',
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
      <div className="px-6 py-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Saved Outfits
        </h2>
      </div>
      
      <div className="p-6">
        {savedOutfits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {savedOutfits.map(outfit => (
              <div key={outfit.id} className="border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  <img 
                    src={outfit.imageUrl} 
                    alt={outfit.title} 
                    className="w-full h-48 object-cover"
                  />
                  <button className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                    <Heart className="text-red-500" size={16} />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">{outfit.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Saved on {new Date(outfit.savedDate).toLocaleDateString()}
                  </p>
                  <div className="mt-3">
                    <Link to={`/recommendations?id=${outfit.id}`} className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Heart className="mx-auto text-gray-400" size={48} />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No saved outfits yet
            </h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Start saving outfits you like for easy reference later.
            </p>
            <div className="mt-4">
              <Button 
                as={Link} 
                to="/recommendations" 
                variant="primary"
              >
                Browse Recommendations
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
      <div className="px-6 py-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Activity History
        </h2>
      </div>
      
      <div className="p-6">
        <div className="space-y-8">
          <div className="border-l-2 border-orange-500 pl-4 relative">
            <div className="absolute w-3 h-3 rounded-full bg-orange-500 -left-[6.5px] top-1"></div>
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900 dark:text-white">Completed Style Questionnaire</h3>
                <span className="text-gray-500 dark:text-gray-400 text-sm">April 15, 2025</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                You completed your personal style questionnaire.
              </p>
            </div>
          </div>
          
          <div className="border-l-2 border-orange-500 pl-4 relative">
            <div className="absolute w-3 h-3 rounded-full bg-orange-500 -left-[6.5px] top-1"></div>
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900 dark:text-white">Uploaded First Photo</h3>
                <span className="text-gray-500 dark:text-gray-400 text-sm">April 15, 2025</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                You uploaded your first photo for style analysis.
              </p>
            </div>
          </div>
          
          <div className="border-l-2 border-orange-500 pl-4 relative">
            <div className="absolute w-3 h-3 rounded-full bg-orange-500 -left-[6.5px] top-1"></div>
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900 dark:text-white">Received Recommendations</h3>
                <span className="text-gray-500 dark:text-gray-400 text-sm">April 15, 2025</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                You received your first set of personalized style recommendations.
              </p>
              <div className="mt-2">
                <Button 
                  as={Link} 
                  to="/recommendations" 
                  variant="outline" 
                  size="sm"
                >
                  View Recommendations
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-l-2 border-orange-500 pl-4 relative">
            <div className="absolute w-3 h-3 rounded-full bg-orange-500 -left-[6.5px] top-1"></div>
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900 dark:text-white">Saved First Outfit</h3>
                <span className="text-gray-500 dark:text-gray-400 text-sm">April 15, 2025</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                You saved "Smart Casual Office Look" to your favorites.
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
      <div className="px-6 py-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Privacy & Data
        </h2>
      </div>
      
      <div className="p-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <ShieldCheck className="text-blue-500 mr-3 mt-0.5" size={20} />
            <div>
              <h3 className="font-medium text-blue-700 dark:text-blue-300">Your Data is Protected</h3>
              <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
                FitFi uses end-to-end encryption to protect your photos and personal information.
                Your data is never shared with third parties without your explicit consent.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Data Preferences
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Photo Storage</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Allow FitFi to store your photos for future recommendations
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input type="checkbox" id="toggle-photos" className="sr-only peer" defaultChecked />
                  <label
                    htmlFor="toggle-photos"
                    className="absolute cursor-pointer bg-gray-300 dark:bg-gray-600 peer-checked:bg-orange-500 rounded-full h-6 w-12 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Style Preferences</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Store style preferences to improve recommendations
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input type="checkbox" id="toggle-style" className="sr-only peer" defaultChecked />
                  <label
                    htmlFor="toggle-style"
                    className="absolute cursor-pointer bg-gray-300 dark:bg-gray-600 peer-checked:bg-orange-500 rounded-full h-6 w-12 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Usage Analytics</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Share anonymous usage data to help improve our service
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input type="checkbox" id="toggle-analytics" className="sr-only peer" defaultChecked />
                  <label
                    htmlFor="toggle-analytics"
                    className="absolute cursor-pointer bg-gray-300 dark:bg-gray-600 peer-checked:bg-orange-500 rounded-full h-6 w-12 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  ></label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Communications
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Receive updates about new style recommendations
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input type="checkbox" id="toggle-email" className="sr-only peer" defaultChecked />
                  <label
                    htmlFor="toggle-email"
                    className="absolute cursor-pointer bg-gray-300 dark:bg-gray-600 peer-checked:bg-orange-500 rounded-full h-6 w-12 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Marketing Emails</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Receive promotional offers and newsletters
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input type="checkbox" id="toggle-marketing" className="sr-only peer" />
                  <label
                    htmlFor="toggle-marketing"
                    className="absolute cursor-pointer bg-gray-300 dark:bg-gray-600 peer-checked:bg-orange-500 rounded-full h-6 w-12 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  ></label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Data Management
            </h3>
            
            <div className="space-y-4">
              <Button 
                variant="outline" 
                icon={<Download size={16} />}
                iconPosition="left"
              >
                Download My Data
              </Button>
              
              <Button 
                variant="danger"
              >
                Delete All My Data
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
      <div className="px-6 py-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Account Settings
        </h2>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Password
            </h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
              
              <Button type="submit" variant="primary">
                Update Password
              </Button>
            </form>
          </div>
          
          <div className="pt-6 border-t dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Subscription
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Current Plan</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Free Plan
                  </p>
                </div>
                <Button variant="primary" size="sm">
                  Upgrade
                </Button>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Upgrade to Premium for unlimited outfit recommendations, advanced styling features, and more.
            </p>
          </div>
          
          <div className="pt-6 border-t dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Display Preferences
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Units</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Measurement units for clothing sizes
                  </p>
                </div>
                <select className="block w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white">
                  <option>Metric (cm)</option>
                  <option>Imperial (inches)</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Currency</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Display prices in your preferred currency
                  </p>
                </div>
                <select className="block w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white">
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>JPY (¥)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Account Management
            </h3>
            
            <div className="space-y-3">
              <Button variant="danger">
                Deactivate Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;