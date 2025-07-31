import React, { useState, useEffect } from 'react';
import { MousePointer, Eye, Zap, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { HeatmapData } from '../../types/analytics';
import { supabase } from '../../lib/supabase';

interface HeatmapViewerProps {
  pageUrl: string;
  className?: string;
}

const HeatmapViewer: React.FC<HeatmapViewerProps> = ({ pageUrl, className = '' }) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'clicks' | 'hovers' | 'scroll'>('clicks');

  useEffect(() => {
    loadHeatmapData();
  }, [pageUrl]);

  const loadHeatmapData = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('heatmap_data')
        .select('*')
        .eq('page_url', pageUrl)
        .gte('timestamp', Date.now() - (7 * 24 * 60 * 60 * 1000)); // Last 7 days

      if (error) {
        console.error('Error loading heatmap data:', error);
        return;
      }

      setHeatmapData(data || []);
    } catch (error) {
      console.error('Error loading heatmap data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getElementIntensity = (selector: string): number => {
    const elementData = heatmapData.filter(d => d.element_selector === selector);
    if (elementData.length === 0) return 0;

    const totalInteractions = elementData.reduce((sum, d) => {
      switch (viewMode) {
        case 'clicks': return sum + d.click_count;
        case 'hovers': return sum + d.hover_count;
        case 'scroll': return sum + (d.scroll_depth / 100);
        default: return sum + d.click_count;
      }
    }, 0);

    // Normalize to 0-1 scale
    const maxInteractions = Math.max(...heatmapData.map(d => {
      switch (viewMode) {
        case 'clicks': return d.click_count;
        case 'hovers': return d.hover_count;
        case 'scroll': return d.scroll_depth / 100;
        default: return d.click_count;
      }
    }));

    return maxInteractions > 0 ? totalInteractions / maxInteractions : 0;
  };

  const getHeatmapColor = (intensity: number): string => {
    if (intensity > 0.8) return 'rgba(255, 0, 0, 0.8)'; // Red - High intensity
    if (intensity > 0.6) return 'rgba(255, 165, 0, 0.7)'; // Orange
    if (intensity > 0.4) return 'rgba(255, 255, 0, 0.6)'; // Yellow
    if (intensity > 0.2) return 'rgba(0, 255, 0, 0.5)'; // Green
    if (intensity > 0) return 'rgba(0, 0, 255, 0.4)'; // Blue - Low intensity
    return 'transparent';
  };

  const getTopElements = () => {
    const elementStats = heatmapData.reduce((acc, data) => {
      const key = data.element_selector;
      if (!acc[key]) {
        acc[key] = { clicks: 0, hovers: 0, scroll_depth: 0, count: 0 };
      }
      acc[key].clicks += data.click_count;
      acc[key].hovers += data.hover_count;
      acc[key].scroll_depth += data.scroll_depth;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(elementStats)
      .map(([selector, stats]) => ({
        selector,
        ...stats,
        avg_scroll_depth: stats.scroll_depth / stats.count
      }))
      .sort((a, b) => {
        switch (viewMode) {
          case 'clicks': return b.clicks - a.clicks;
          case 'hovers': return b.hovers - a.hovers;
          case 'scroll': return b.avg_scroll_depth - a.avg_scroll_depth;
          default: return b.clicks - a.clicks;
        }
      })
      .slice(0, 10);
  };

  const getViewModeIcon = () => {
    switch (viewMode) {
      case 'clicks': return <MousePointer className="w-4 h-4" />;
      case 'hovers': return <Eye className="w-4 h-4" />;
      case 'scroll': return <Zap className="w-4 h-4" />;
      default: return <MousePointer className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-3xl shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-medium text-gray-900">Heatmap Analysis</h3>
          <p className="text-gray-600 text-sm">{pageUrl}</p>
        </div>
        
        {/* View Mode Selector */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'clicks', label: 'Clicks' },
            { id: 'hovers', label: 'Hovers' },
            { id: 'scroll', label: 'Scroll' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === mode.id
                  ? 'bg-white text-[#89CFF0] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center space-x-4 mb-6">
        <span className="text-sm text-gray-600">Intensity:</span>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(0, 0, 255, 0.4)' }}></div>
          <span className="text-xs text-gray-500">Low</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(255, 255, 0, 0.6)' }}></div>
          <span className="text-xs text-gray-500">Medium</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(255, 0, 0, 0.8)' }}></div>
          <span className="text-xs text-gray-500">High</span>
        </div>
      </div>

      {/* Top Elements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            {getViewModeIcon()}
            <span className="ml-2">Top Elements ({viewMode})</span>
          </h4>
          
          <div className="space-y-2">
            {getTopElements().map((element, index) => {
              const intensity = getElementIntensity(element.selector);
              const value = viewMode === 'clicks' ? element.clicks : 
                          viewMode === 'hovers' ? element.hovers : 
                          Math.round(element.avg_scroll_depth);

              return (
                <motion.div
                  key={element.selector}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: getHeatmapColor(intensity) }}
                    ></div>
                    <span className="text-sm font-mono text-gray-700 truncate max-w-[200px]">
                      {element.selector}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {value.toLocaleString()}
                    {viewMode === 'scroll' && '%'}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            UX Insights
          </h4>
          
          <div className="space-y-3">
            {/* Dead clicks detection */}
            {heatmapData.some(d => d.click_count > 0 && d.element_selector.includes('div')) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Dead Clicks Detected</span>
                </div>
                <p className="text-xs text-red-700">
                  Users are clicking on non-interactive elements. Consider adding hover states or making elements clickable.
                </p>
              </div>
            )}

            {/* Low scroll depth */}
            {heatmapData.some(d => d.scroll_depth < 50) && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Eye className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Low Scroll Engagement</span>
                </div>
                <p className="text-xs text-yellow-700">
                  Many users don't scroll past 50%. Consider moving important content higher up.
                </p>
              </div>
            )}

            {/* High engagement areas */}
            {getTopElements().length > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">High Engagement</span>
                </div>
                <p className="text-xs text-green-700">
                  Element "{getTopElements()[0]?.selector}" has the highest {viewMode} rate. 
                  Consider similar design patterns elsewhere.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapViewer;