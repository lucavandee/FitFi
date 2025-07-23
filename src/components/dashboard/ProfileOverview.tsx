import React from 'react';
import { User, Calendar, Star, TrendingUp } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const ProfileOverview: React.FC = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg">
        <p>Geen gebruikersgegevens beschikbaar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Summary */}
      <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-secondary mb-6">Profiel Overzicht</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="text-secondary" size={20} />
              <div>
                <p className="text-sm text-gray-600">Naam</p>
                <p className="font-medium">{user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Calendar className="text-secondary" size={20} />
              <div>
                <p className="text-sm text-gray-600">Lid sinds</p>
                <p className="font-medium">December 2024</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Star className="text-secondary" size={20} />
              <div>
                <p className="text-sm text-gray-600">Account Type</p>
                <p className="font-medium">{user.isPremium ? 'Premium' : 'Basis'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <TrendingUp className="text-secondary" size={20} />
              <div>
                <p className="text-sm text-gray-600">Opgeslagen Outfits</p>
                <p className="font-medium">{user.savedRecommendations?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Style Preferences Summary */}
      <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Jouw Stijlvoorkeuren</h3>
        
        <div className="space-y-3">
          {Object.entries(user.stylePreferences || {}).map(([style, value]) => (
            <div key={style} className="flex items-center justify-between">
              <span className="capitalize">{style}</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-secondary h-2 rounded-full transition-all"
                    style={{ width: `${(value / 5) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{value}/5</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;