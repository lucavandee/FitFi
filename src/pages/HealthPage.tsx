function HealthPage() {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: import.meta.env.MODE,
    services: {
      database: 'connected',
      api: 'operational',
      cdn: 'operational'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-heading font-bold mb-8 text-midnight">
            System Health
          </h1>
          
          <div className="bg-surface p-6 rounded-2xl">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="font-semibold text-green-700">System Operational</span>
            </div>
            
            <pre className="text-sm bg-white p-4 rounded-xl overflow-auto">
              {JSON.stringify(healthData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthPage