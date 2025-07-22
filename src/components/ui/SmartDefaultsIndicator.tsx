import React from 'react';
import { Brain, Clock, Calendar, MapPin } from 'lucide-react';
import { SmartDefaults } from '../../utils/smartDefaults';

interface SmartDefaultsIndicatorProps {
  defaults: SmartDefaults;
  className?: string;
  showDetails?: boolean;
}

/**
 * Component that shows smart defaults information to the user
 * Provides transparency about AI-generated suggestions
 */
const SmartDefaultsIndicator: React.FC<SmartDefaultsIndicatorProps> = ({
  defaults,
  className = '',
  showDetails = false
}) => {
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.8) return 'Hoge zekerheid';
    if (confidence >= 0.6) return 'Gemiddelde zekerheid';
    return 'Lage zekerheid';
  };

  if (!showDetails) {
    return (
      <div className={`inline-flex items-center space-x-2 text-sm ${className}`}>
        <Brain size={16} className="text-blue-500" />
        <span className="text-gray-600 dark:text-gray-400">
          AI-suggestie
        </span>
        <span className={`font-medium ${getConfidenceColor(defaults.confidence)}`}>
          ({Math.round(defaults.confidence * 100)}%)
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <Brain className="text-blue-600 dark:text-blue-400" size={20} />
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            🧠 AI-gegenereerde suggesties
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar size={14} className="text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                Seizoen: <strong>{defaults.season}</strong>
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock size={14} className="text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                Gelegenheden: <strong>{defaults.occasions.join(', ')}</strong>
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <MapPin size={14} className="text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                Stijl: <strong>{defaults.archetype}</strong>
              </span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {defaults.reasoning}
              </span>
              <span className={`text-xs font-medium ${getConfidenceColor(defaults.confidence)}`}>
                {getConfidenceLabel(defaults.confidence)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartDefaultsIndicator;