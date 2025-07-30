import React from 'react';
import { User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  profile: {
    full_name: string;
    avatar_url?: string;
  };
  className?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ profile, className = '' }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className={`bg-white rounded-3xl shadow-card p-6 mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="relative">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`${profile.full_name} avatar`}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brandGradientFrom to-brandGradientTo flex items-center justify-center text-white font-semibold text-lg">
                {getInitials(profile.full_name)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>

          {/* Welcome Message */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welkom, {profile.full_name}!
            </h1>
            <p className="text-gray-600">
              Klaar voor je volgende stijl-avontuur?
            </p>
          </div>
        </div>

        {/* Settings Link */}
        <Link
          to="/profile"
          className="p-3 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
          aria-label="Profiel instellingen"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </Link>
      </div>
    </header>
  );
};

export default DashboardHeader;