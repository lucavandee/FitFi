import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Server, GitBranch, Clock, CheckCircle, XCircle } from 'lucide-react';
import DeploymentStatus from '../components/ui/DeploymentStatus';
import Button from '../components/ui/Button';

const DeploymentStatusPage: React.FC = () => {
  // Mock deployment history data
  const deploymentHistory = [
    {
      id: 'deploy_123',
      status: 'success',
      branch: 'main',
      commit: 'a1b2c3d',
      author: 'Luc van Dokkum',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      duration: '2m 34s',
      url: 'https://dapper-sunflower-9949c9.netlify.app'
    },
    {
      id: 'deploy_122',
      status: 'error',
      branch: 'feature/new-quiz',
      commit: 'e5f6g7h',
      author: 'Emma Jansen',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      duration: '3m 12s',
      error: 'Build failed: CSS processing error'
    },
    {
      id: 'deploy_121',
      status: 'success',
      branch: 'main',
      commit: 'i9j8k7l',
      author: 'Thomas Bakker',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      duration: '2m 45s',
      url: 'https://dapper-sunflower-9949c9.netlify.app'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mr-4">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Deployment Status</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
            Monitor the deployment status of your FitFi application. View current status, deployment history, and manage your deployments.
          </p>
        </div>

        {/* Current Status Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-1">
            <DeploymentStatus className="h-full" />
          </div>
          
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Deployment Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Server className="text-gray-400 mt-1 mr-3" size={20} />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Production Environment</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    <a 
                      href="https://dapper-sunflower-9949c9.netlify.app" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      https://dapper-sunflower-9949c9.netlify.app
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <GitBranch className="text-gray-400 mt-1 mr-3" size={20} />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Current Branch</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">main</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="text-gray-400 mt-1 mr-3" size={20} />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Last Deployment</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {deploymentHistory[0].timestamp.toLocaleString()} ({deploymentHistory[0].duration})
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-4">
              <Button
                variant="primary"
                icon={<RefreshCw size={16} />}
                iconPosition="left"
              >
                Trigger New Deployment
              </Button>
              
              <Button
                variant="outline"
              >
                View Logs
              </Button>
            </div>
          </div>
        </div>

        {/* Deployment History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-12">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Deployment History</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Branch
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Commit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Author
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {deploymentHistory.map((deployment) => (
                  <tr key={deployment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {deployment.status === 'success' ? (
                          <CheckCircle className="text-green-500 mr-2" size={16} />
                        ) : (
                          <XCircle className="text-red-500 mr-2" size={16} />
                        )}
                        <span className={`text-sm font-medium ${
                          deployment.status === 'success' 
                            ? 'text-green-700 dark:text-green-400' 
                            : 'text-red-700 dark:text-red-400'
                        }`}>
                          {deployment.status === 'success' ? 'Success' : 'Failed'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {deployment.branch}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {deployment.commit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {deployment.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {deployment.timestamp.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {deployment.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {deployment.status === 'success' ? (
                        <a 
                          href={deployment.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        <button className="text-blue-600 dark:text-blue-400 hover:underline">
                          View Logs
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deployment Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Deployment Settings</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Build Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Build Command
                    </label>
                    <input
                      type="text"
                      value="npm run build"
                      readOnly
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Publish Directory
                    </label>
                    <input
                      type="text"
                      value="dist"
                      readOnly
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Environment Variables</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Node Version
                    </label>
                    <input
                      type="text"
                      value="18.x"
                      readOnly
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      API Endpoint
                    </label>
                    <input
                      type="text"
                      value="https://api.fitfi.ai/v1"
                      readOnly
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button variant="outline">
                Edit Deployment Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentStatusPage;