import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useUser } from '../context/UserContext';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import FunnelVisualizer from '../components/analytics/FunnelVisualizer';
import HeatmapViewer from '../components/analytics/HeatmapViewer';
import LoadingFallback from '../components/ui/LoadingFallback';
import Button from '../components/ui/Button';

const AnalyticsPage: React.FC = () => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <LoadingFallback fullScreen message="Analytics laden..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-card text-center max-w-md">
          <div className="w-16 h-16 bg-[#89CFF0]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-8 h-8 text-[#89CFF0]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Toegang vereist</h2>
          <p className="text-gray-600 mb-6">
            Je moet ingelogd zijn om analytics te bekijken.
          </p>
          <Button as={Link} to="/inloggen" variant="primary" fullWidth>
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  // Mock funnel data for visualization
  const onboardingSteps = [
    { id: 'landing', name: 'Landing Page', order: 1 },
    { id: 'signup', name: 'Sign Up', order: 2 },
    { id: 'quiz_start', name: 'Quiz Start', order: 3 },
    { id: 'quiz_complete', name: 'Quiz Complete', order: 4 },
    { id: 'results_view', name: 'Results View', order: 5 }
  ];

  const mockFunnelMetrics = {
    total_entries: 1250,
    completion_rate: 0.68,
    drop_off_points: [
      { step: 'signup', rate: 0.25 },
      { step: 'quiz_start', rate: 0.15 },
      { step: 'quiz_complete', rate: 0.35 }
    ],
    avg_completion_time: 180000,
    conversion_value: 2840.50
  };

  return (
    <>
      <Helmet>
        <title>Analytics Dashboard - Diepgaande Gebruikersinzichten | FitFi</title>
        <meta name="description" content="Bekijk funnel analytics, heatmaps, en AI-powered voorspellingen voor datagedreven conversie-optimalisatie." />
        <meta property="og:title" content="FitFi Analytics Dashboard" />
        <meta property="og:description" content="Diepgaande gebruikersinzichten en conversie-optimalisatie." />
        <link rel="canonical" href="https://fitfi.app/analytics" />
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
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-4xl font-light text-gray-900 mb-4">
                Analytics Dashboard
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Diepgaande inzichten in gebruikersgedrag, conversie-funnels en AI-powered voorspellingen
              </p>
            </div>
          </div>

          {/* Main Dashboard */}
          <div className="space-y-8">
            <AnalyticsDashboard />
            
            {/* Detailed Funnel Visualization */}
            <FunnelVisualizer
              funnelName="onboarding"
              metrics={mockFunnelMetrics}
              steps={onboardingSteps}
            />
            
            {/* Heatmap Viewers for Key Pages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <HeatmapViewer pageUrl="/" />
              <HeatmapViewer pageUrl="/quiz" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalyticsPage;