import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Target, AlertCircle, RefreshCw } from 'lucide-react';
import { track } from '../../utils/analytics';
import Button from '../ui/Button';
import LoadingFallback from '../ui/LoadingFallback';

interface AnalyticsDashboardProps {
  className?: string;
}

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  conversionRate: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number; bounceRate: number }>;
  recentEvents: Array<{ event: string; count: number; trend: 'up' | 'down' | 'stable' }>;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
    
    // Track dashboard load
    track('analytics_dashboard_loaded', {
      event_category: 'admin',
      event_label: 'dashboard_view'
    });
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock analytics data for demonstration
      const mockMetrics: DashboardMetrics = {
        totalUsers: 1247,
        activeUsers: 89,
        conversionRate: 12.4,
        avgSessionDuration: 342,
        topPages: [
          { page: '/', views: 2341, bounceRate: 34.2 },
          { page: '/quiz', views: 1876, bounceRate: 28.7 },
          { page: '/results', views: 1543, bounceRate: 15.3 },
          { page: '/dashboard', views: 987, bounceRate: 22.1 },
          { page: '/outfits', views: 756, bounceRate: 31.8 }
        ],
        recentEvents: [
          { event: 'quiz_complete', count: 156, trend: 'up' },
          { event: 'outfit_save', count: 234, trend: 'up' },
          { event: 'product_click', count: 89, trend: 'stable' },
          { event: 'social_share', count: 45, trend: 'down' },
          { event: 'premium_upgrade', count: 12, trend: 'up' }
        ]
      };
      
      setMetrics(mockMetrics);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Kon dashboard data niet laden');
      
      track('analytics_dashboard_error', {
        event_category: 'error',
        event_label: 'dashboard_load_failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    track('analytics_dashboard_refresh', {
      event_category: 'admin',
      event_label: 'manual_refresh'
    });
    
    loadDashboardData();
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-600 transform rotate-180" />;
      case 'stable': return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
    }
  };

  if (isLoading) {
    return <LoadingFallback message="Analytics dashboard laden..." />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-4">Dashboard Error</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button
          onClick={handleRefresh}
          variant="primary"
          icon={<RefreshCw size={16} />}
          iconPosition="left"
          className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
        >
          Probeer opnieuw
        </Button>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>
          <p className="text-gray-600">Real-time inzichten in gebruikersgedrag</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Laatste update: {lastRefresh.toLocaleTimeString('nl-NL')}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            icon={<RefreshCw size={16} />}
            iconPosition="left"
            className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
          >
            Vernieuwen
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{metrics.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Totale gebruikers</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{metrics.activeUsers}</div>
              <div className="text-sm text-gray-600">Actieve gebruikers</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{metrics.conversionRate}%</div>
              <div className="text-sm text-gray-600">Conversie ratio</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{Math.round(metrics.avgSessionDuration / 60)}m</div>
              <div className="text-sm text-gray-600">Gem. sessieduur</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Top Pagina's</h3>
          <div className="space-y-4">
            {metrics.topPages.map((page, index) => (
              <div key={page.page} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#89CFF0]/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-[#89CFF0]">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{page.page}</div>
                    <div className="text-sm text-gray-600">{page.views.toLocaleString()} views</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{page.bounceRate}%</div>
                  <div className="text-xs text-gray-500">bounce rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Event Trends</h3>
          <div className="space-y-4">
            {metrics.recentEvents.map((event) => (
              <div key={event.event} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getTrendIcon(event.trend)}
                  <div>
                    <div className="font-medium text-gray-900">{event.event}</div>
                    <div className="text-sm text-gray-600">{event.count} events</div>
                  </div>
                </div>
                <div className={`text-sm font-medium ${getTrendColor(event.trend)}`}>
                  {event.trend === 'up' ? '↗' : event.trend === 'down' ? '↘' : '→'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;