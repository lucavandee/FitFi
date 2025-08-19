import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useUser } from '../context/UserContext';
import { useGamification } from '../context/GamificationContext';
import GamificationDashboard from '../components/gamification/GamificationDashboard';
import LoadingFallback from '../components/ui/LoadingFallback';
import Button from '../components/ui/Button';

const GamificationPage: React.FC = () => {
  const { user, isLoading: userLoading } = useUser();
  const { isLoading: gamificationLoading, error } = useGamification();

  if (userLoading || gamificationLoading) {
    return <LoadingFallback fullScreen message="Gamification laden..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-card text-center max-w-md">
          <div className="w-16 h-16 bg-[#89CFF0]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-8 h-8 text-[#89CFF0]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Inloggen vereist</h2>
          <p className="text-gray-600 mb-6">
            Je moet ingelogd zijn om je gamification dashboard te bekijken.
          </p>
          <Button as={Link} to="/inloggen" variant="primary" fullWidth>
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  // Show error state with fallback instead of redirect
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center text-[#89CFF0] hover:text-[#89CFF0]/80 transition-colors mb-6"
            >
              <ArrowLeft size={20} className="mr-2" />
              Terug naar dashboard
            </Link>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">We konden je levels niet laden</h2>
            <p className="text-gray-600 mb-6">
              Er ging iets mis bij het laden van je gamification data. Probeer het later opnieuw.
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => window.location.reload()} 
                variant="primary"
                className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
              >
                Probeer opnieuw
              </Button>
              <Button 
                as={Link} 
                to="/dashboard" 
                variant="outline"
                className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
              >
                Terug naar dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Gamification Dashboard - Levels, Challenges & Leaderboards | FitFi</title>
        <meta name="description" content="Bekijk je level, voltooi challenges en vergelijk je score met andere FitFi gebruikers op het gamification dashboard." />
        <meta property="og:title" content="FitFi Gamification Dashboard" />
        <meta property="og:description" content="Levels, challenges en leaderboards voor de ultieme FitFi ervaring." />
        <link rel="canonical" href="https://fitfi.app/gamification" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center text-[#89CFF0] hover:text-[#89CFF0]/80 transition-colors mb-6"
            >
              <ArrowLeft size={20} className="mr-2" />
              Terug naar dashboard
            </Link>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-4xl font-light text-gray-900 mb-4">
                Gamification Dashboard
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Verdien punten, voltooi challenges en klim omhoog in de leaderboards
              </p>
            </div>
          </div>

          {/* Main Dashboard */}
          <GamificationDashboard />
        </div>
      </div>
    </>
  );
};

export default GamificationPage;