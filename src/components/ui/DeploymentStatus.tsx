import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';

interface DeploymentStatusProps {
  className?: string;
}

type DeploymentStatus = 'idle' | 'building' | 'ready' | 'error' | 'unknown';

const DeploymentStatus: React.FC<DeploymentStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<DeploymentStatus>('unknown');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkDeploymentStatus = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call to your deployment service
      // For example: const response = await fetch('/api/deployment-status');
      
      // Simulate API call for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, we'll randomly select a status
      const statuses: DeploymentStatus[] = ['idle', 'building', 'ready', 'error'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      setStatus(randomStatus);
      
      if (randomStatus === 'ready') {
        setDeployUrl('https://dapper-sunflower-9949c9.netlify.app');
      }
      
      setLastChecked(new Date());
    } catch (err) {
      setError('Failed to check deployment status');
      setStatus('unknown');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkDeploymentStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkDeploymentStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'building':
        return <RefreshCw className="text-blue-500 animate-spin" size={20} />;
      case 'error':
        return <XCircle className="text-red-500" size={20} />;
      case 'idle':
      case 'unknown':
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'ready':
        return 'Deployment ready';
      case 'building':
        return 'Building...';
      case 'error':
        return 'Deployment failed';
      case 'idle':
        return 'Waiting to deploy';
      case 'unknown':
      default:
        return 'Status unknown';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'ready':
        return 'text-green-700 dark:text-green-400';
      case 'building':
        return 'text-blue-700 dark:text-blue-400';
      case 'error':
        return 'text-red-700 dark:text-red-400';
      case 'idle':
      case 'unknown':
      default:
        return 'text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Deployment Status</h3>
        <button
          onClick={checkDeploymentStatus}
          disabled={isLoading}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Refresh deployment status"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      <div className="flex items-center space-x-3 mb-3">
        {getStatusIcon()}
        <span className={`font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      
      {deployUrl && status === 'ready' && (
        <div className="mb-3">
          <a
            href={deployUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            {deployUrl}
          </a>
        </div>
      )}
      
      {error && (
        <div className="text-red-500 text-sm mb-3">
          {error}
        </div>
      )}
      
      {lastChecked && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Last checked: {lastChecked.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default DeploymentStatus;