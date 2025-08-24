import React, { useState, useEffect } from "react";
import {
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { dataService } from "@/services/DataService";
import { DATA_CONFIG } from "@/config/dataConfig";
import Button from "@/components/ui/Button";

interface DataServiceDebugProps {
  className?: string;
}

/**
 * Debug component for monitoring data service health
 * Only shown in development mode
 */
const DataServiceDebug: React.FC<DataServiceDebugProps> = ({
  className = "",
}) => {
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [errors, setErrors] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStats = () => {
    setCacheStats(getCacheStats());
    setErrors(getRecentErrors());
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = () => {
    clearCache();
    refreshStats();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate refresh
    refreshStats();
    setIsRefreshing(false);
  };

  // Only show in development
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">Data Service Debug</h3>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            icon={
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            }
          >
            Refresh
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCache}
            className="text-red-600 hover:bg-red-50"
          >
            Clear Cache
          </Button>
        </div>
      </div>

      {/* Configuration Status */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            {DATA_CONFIG.USE_SUPABASE ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-sm font-medium">Supabase</span>
          </div>
          <p className="text-xs text-gray-600">
            {DATA_CONFIG.USE_SUPABASE ? "Enabled" : "Disabled"}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">Local JSON</span>
          </div>
          <p className="text-xs text-gray-600">Always available</p>
        </div>
      </div>

      {/* Cache Stats */}
      {cacheStats && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Cache Status
          </h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Entries:</span>
              <span className="text-sm font-medium">{cacheStats.size}</span>
            </div>

            {cacheStats.entries.slice(0, 3).map((entry: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-gray-500 truncate">{entry.key}</span>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-1 py-0.5 rounded text-xs ${
                      entry.source === "supabase"
                        ? "bg-green-100 text-green-700"
                        : entry.source === "local"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {entry.source}
                  </span>
                  <span className="text-gray-400">
                    {Math.round(entry.age / 1000)}s
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Errors */}
      {errors.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Recent Errors
          </h4>
          <div className="space-y-2">
            {errors.slice(0, 3).map((error, index) => (
              <div key={index} className="bg-red-50 rounded-lg p-2">
                <div className="flex items-center space-x-2 mb-1">
                  <AlertCircle className="w-3 h-3 text-red-600" />
                  <span className="text-xs font-medium text-red-800">
                    {error.source}/{error.operation}
                  </span>
                  <Clock className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-red-600">
                    {Math.round((Date.now() - error.timestamp) / 1000)}s ago
                  </span>
                </div>
                <p className="text-xs text-red-700 truncate">{error.error}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataServiceDebug;
