import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, MousePointer, Brain, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnalyticsDashboardData, FunnelMetrics, HeatmapSummary, PredictiveInsight } from '../../types/analytics';
import { advancedAnalytics } from '../../services/AdvancedAnalytics';
import LoadingFallback from '../ui/LoadingFallback';
import Button from '../ui/Button';

interface AnalyticsDashboardProps {
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className = '' }) => {
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'funnels' | 'heatmaps' | 'predictions' | 'realtime'>('funnels');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await advancedAnalytics.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (isLoading && !dashboardData) {
    return <LoadingFallback message="Analytics dashboard laden..." />;
  }

  if (!dashboardData) {
    return (
      <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics niet beschikbaar</h3>
        <p className="text-gray-600 mb-4">Er ging iets mis bij het laden van de analytics data.</p>
        <Button onClick={loadDashboardData} variant="primary">
          Probeer opnieuw
        </Button>
      </div>
    );
  }

  const renderFunnelAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(dashboardData.funnels).map(([funnelName, metrics]) => (
          <motion.div
            key={funnelName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 capitalize">{funnelName} Funnel</h3>
              <div className="text-2xl font-bold text-[#89CFF0]">
                {Math.round(metrics.completion_rate * 100)}%
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Entries:</span>
                <span className="font-medium">{metrics.total_entries.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg. Time:</span>
                <span className="font-medium">{Math.round(metrics.avg_completion_time / 1000)}s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Value:</span>
                <span className="font-medium">€{metrics.conversion_value.toFixed(2)}</span>
              </div>
            </div>

            {/* Drop-off points */}
            {metrics.drop_off_points.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Top Drop-off Points:</h4>
                <div className="space-y-1">
                  {metrics.drop_off_points.slice(0, 3).map((point, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-gray-600">{point.step}:</span>
                      <span className="text-red-600">{Math.round(point.rate * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderHeatmapAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(dashboardData.heatmaps).map(([pageName, summary]) => (
          <motion.div
            key={pageName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 capitalize">{pageName}</h3>
              <MousePointer className="w-5 h-5 text-[#89CFF0]" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sessions:</span>
                <span className="font-medium">{summary.total_sessions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Scroll Depth:</span>
                <span className="font-medium">{Math.round(summary.avg_scroll_depth)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Dead Clicks:</span>
                <span className="text-red-600">{Math.round(summary.dead_click_rate * 100)}%</span>
              </div>
            </div>

            {/* Top clicked elements */}
            {summary.top_clicked_elements.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Top Clicks:</h4>
                <div className="space-y-1">
                  {summary.top_clicked_elements.slice(0, 3).map((element, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-gray-600 truncate">{element.element}:</span>
                      <span className="text-[#89CFF0]">{element.clicks}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderPredictiveAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(dashboardData.predictions).map(([predictionType, insights]) => (
          <motion.div
            key={predictionType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 capitalize">
                {predictionType.replace('_', ' ')}
              </h3>
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            
            <div className="space-y-3">
              {insights.slice(0, 5).map((insight, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      User #{insight.user_id.slice(-6)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      insight.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                      insight.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                      insight.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {insight.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{insight.recommended_action}</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Confidence: {Math.round(insight.confidence * 100)}%</span>
                    <span className="text-[#89CFF0]">€{insight.potential_value.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderRealtimeMetrics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 text-center"
        >
          <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {dashboardData.realtime.active_users}
          </div>
          <div className="text-sm text-gray-600">Active Users</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 text-center"
        >
          <TrendingUp className="w-8 h-8 text-[#89CFF0] mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {Math.round(dashboardData.realtime.conversion_rate * 100)}%
          </div>
          <div className="text-sm text-gray-600">Conversion Rate</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 text-center"
        >
          <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {Math.round(dashboardData.realtime.avg_session_duration / 1000)}s
          </div>
          <div className="text-sm text-gray-600">Avg. Session</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 text-center"
        >
          <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {Math.round(dashboardData.realtime.bounce_rate * 100)}%
          </div>
          <div className="text-sm text-gray-600">Bounce Rate</div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Diepgaande inzichten in gebruikersgedrag en conversie</p>
        </div>
        
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={refreshing}
          className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
        >
          {refreshing ? 'Vernieuwen...' : 'Vernieuw Data'}
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1 shadow-sm">
        <div className="flex space-x-1">
          {[
            { id: 'funnels', label: 'Funnels', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'heatmaps', label: 'Heatmaps', icon: <MousePointer className="w-4 h-4" /> },
            { id: 'predictions', label: 'AI Predictions', icon: <Brain className="w-4 h-4" /> },
            { id: 'realtime', label: 'Real-time', icon: <BarChart3 className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-[#89CFF0] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'funnels' && renderFunnelAnalytics()}
        {activeTab === 'heatmaps' && renderHeatmapAnalytics()}
        {activeTab === 'predictions' && renderPredictiveAnalytics()}
        {activeTab === 'realtime' && renderRealtimeMetrics()}
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;