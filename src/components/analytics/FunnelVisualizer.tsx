import React from 'react';
import { ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';
import { FunnelMetrics } from '../../types/analytics';

interface FunnelVisualizerProps {
  funnelName: string;
  metrics: FunnelMetrics;
  steps: Array<{ id: string; name: string; order: number }>;
  className?: string;
}

const FunnelVisualizer: React.FC<FunnelVisualizerProps> = ({
  funnelName,
  metrics,
  steps,
  className = ''
}) => {
  const getStepCompletionRate = (stepId: string): number => {
    const dropOff = metrics.drop_off_points.find(p => p.step === stepId);
    return dropOff ? 1 - dropOff.rate : 0.9; // Default to 90% if no drop-off data
  };

  const getStepColor = (completionRate: number): string => {
    if (completionRate > 0.8) return 'bg-green-500';
    if (completionRate > 0.6) return 'bg-yellow-500';
    if (completionRate > 0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStepWidth = (completionRate: number): string => {
    return `${Math.max(completionRate * 100, 20)}%`; // Minimum 20% width for visibility
  };

  return (
    <div className={`bg-white rounded-3xl shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-gray-900 capitalize">
          {funnelName} Funnel Visualization
        </h3>
        <div className="text-sm text-gray-600">
          {metrics.total_entries.toLocaleString()} total entries
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const completionRate = getStepCompletionRate(step.id);
          const userCount = Math.round(metrics.total_entries * completionRate);
          const isDropOffPoint = metrics.drop_off_points.some(p => p.step === step.id && p.rate > 0.3);

          return (
            <div
              key={step.id}
              className="relative animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Step Container */}
              <div className="flex items-center space-x-4">
                {/* Step Number */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  completionRate > 0.5 ? 'bg-[#89CFF0]' : 'bg-gray-400'
                }`}>
                  {step.order}
                </div>

                {/* Funnel Bar */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{step.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {userCount.toLocaleString()} users ({Math.round(completionRate * 100)}%)
                      </span>
                      {isDropOffPoint && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getStepColor(completionRate)} flex items-center justify-end pr-3 transition-all duration-1000 ease-out`}
                      style={{ 
                        width: getStepWidth(completionRate),
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <span className="text-white text-xs font-medium">
                        {Math.round(completionRate * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drop-off Warning */}
              {isDropOffPoint && (
                <div
                  className="ml-12 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in"
                  style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                >
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-800 font-medium">High Drop-off Point</span>
                  </div>
                  <p className="text-xs text-red-700 mt-1">
                    {Math.round(metrics.drop_off_points.find(p => p.step === step.id)?.rate! * 100)}% of users drop off at this step
                  </p>
                </div>
              )}

              {/* Connector Arrow */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-2">
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-[#89CFF0]">
              {Math.round(metrics.completion_rate * 100)}%
            </div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {Math.round(metrics.avg_completion_time / 1000)}s
            </div>
            <div className="text-sm text-gray-600">Avg. Time</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              €{metrics.conversion_value.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunnelVisualizer;