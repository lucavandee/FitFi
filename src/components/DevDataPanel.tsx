import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, Database, Clock } from 'lucide-react';
import { getFetchDiagnostics, getFetchDiagnosticsSummary, clearCache, getDataSource } from '../services/DataRouter';

interface DevDataPanelProps {
  onRefresh?: () => Promise<void>;
  className?: string;
}

/**
 * Development monitoring panel for DataRouter
 * Shows current data source, fetch diagnostics, and cache status
 * Only visible in development mode
 */
const DevDataPanel: React.FC<DevDataPanelProps> = ({ onRefresh, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const diagnostics = getFetchDiagnostics();
  const dataSource = getDataSource();
  
  const handleRefresh = async () => {
    if (isRefreshing || !onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleClearCache = () => {
    clearCache();
    if (onRefresh) {
      handleRefresh();
    }
  };
  
  const getDataSourceIcon = () => {
    switch (dataSource) {
      case 'supabase':
        return '📦';
      case 'bolt':
        return '⚡';
      case 'zalando':
        return '🛍️';
      case 'local':
        return '🧪';
      default:
        return '❓';
    }
  };
  
  const getDataSourceColor = () => {
    switch (dataSource) {
      case 'supabase':
        return 'text-green-500';
      case 'bolt':
        return 'text-purple-500';
      case 'zalando':
        return 'text-blue-500';
      case 'local':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    } catch (e) {
      return timestamp;
    }
  };
  
  return (
    <div className={`fixed bottom-0 right-0 w-full md:w-96 bg-gray-900 border-t border-l border-gray-700 shadow-lg z-50 ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Database size={16} className="mr-2 text-gray-400" />
          <span className="font-mono text-sm text-white">DataRouter Dev Panel</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`font-mono text-xs px-2 py-1 rounded ${getDataSourceColor()} bg-opacity-20`}>
            {getDataSourceIcon()} {dataSource}
          </span>
          {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />}
        </div>
      </div>
      
      {/* Content */}
      {isExpanded && (
        <div className="p-3 border-t border-gray-700 font-mono text-xs">
          {/* Actions */}
          <div className="flex justify-between mb-3">
            <button 
              className="px-2 py-1 bg-blue-900 hover:bg-blue-800 text-blue-300 rounded flex items-center transition-colors"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw size={12} className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <button 
              className="px-2 py-1 bg-red-900 hover:bg-red-800 text-red-300 rounded transition-colors"
              onClick={handleClearCache}
            >
              Clear Cache
            </button>
          </div>
          
          {/* Diagnostics */}
          <div className="space-y-2">
            {/* Operation info */}
            <div className="bg-gray-800 p-2 rounded">
              <div className="flex justify-between text-gray-400 mb-1">
                <span>Operation:</span>
                <span className="text-white">{diagnostics.operation}</span>
              </div>
              <div className="flex justify-between text-gray-400 mb-1">
                <span>Timestamp:</span>
                <span className="text-white">{formatTimestamp(diagnostics.timestamp)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Cache:</span>
                <span className={diagnostics.cacheUsed ? 'text-green-400' : 'text-gray-400'}>
                  {diagnostics.cacheUsed 
                    ? `Used (${Math.round((diagnostics.cacheAge || 0) / 1000)}s old)` 
                    : 'Not used'}
                </span>
              </div>
            </div>
            
            {/* Attempts */}
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-gray-400 mb-1">Data Source Attempts:</div>
              {diagnostics.attempts.map((attempt, index) => (
                <div key={index} className="flex items-center mb-1 ml-2">
                  <span className={`mr-2 ${attempt.success ? 'text-green-500' : 'text-red-500'}`}>
                    {attempt.success ? '✓' : '✗'}
                  </span>
                  <span className="text-gray-300">{attempt.source}</span>
                  {attempt.duration !== undefined && (
                    <span className="ml-auto text-gray-400">
                      <Clock size={10} className="inline mr-1" />
                      {attempt.duration}ms
                    </span>
                  )}
                  {attempt.error && (
                    <span className="ml-2 text-red-400 truncate max-w-[150px]" title={attempt.error}>
                      {attempt.error}
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Final source */}
            <div className="bg-gray-800 p-2 rounded">
              <div className="flex justify-between text-gray-400">
                <span>Final Source:</span>
                <span className={getDataSourceColor()}>
                  {getDataSourceIcon()} {diagnostics.finalSource}
                </span>
              </div>
            </div>
          </div>
          
          {/* Raw diagnostics */}
          <div className="mt-3 p-2 bg-gray-800 rounded">
            <div className="text-gray-400 mb-1">Diagnostics Summary:</div>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
              {getFetchDiagnosticsSummary()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevDataPanel;