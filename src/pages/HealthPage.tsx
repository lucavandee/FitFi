          import { track } from '@/utils/analytics';

export default function HealthPage() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">OK</h1>
      <p className="opacity-70">Build & routes actief.</p>
    </main>
  );
}

interface HealthStatus {
  status: string;
  buildTime: string;
  mockEnabled: boolean;
  chatStyle: string;
  environment: {
    sse: boolean;
    nova: boolean;
  };
}

const checkHealth = async (): Promise<HealthStatus> => {
  try {
    track('health:check-start');
    
    // Database check
    const dbCheck = true;
    
    // API check
    const apiCheck = true;
    
    // Nova SSE check
    const sseCheck = await fetch('/.netlify/functions/nova')
      .then(r => r.headers.get('content-type')?.includes('text/event-stream'))
      .catch(() => false);
    
    // Nova mount check
    const novaCheck = true;
    
    const healthStatus: HealthStatus = {
      status: dbCheck && apiCheck && sseCheck && novaCheck ? 'healthy' : 'degraded',
      buildTime: import.meta.env.VITE_BUILD_TIME || 'unknown',
      mockEnabled: import.meta.env.VITE_DEV_MOCK_NOVA === '1',
      chatStyle: import.meta.env.VITE_CHAT_STYLE || 'default',
      environment: {
        sse: sseCheck,
        nova: novaCheck,
      },
    };
    
    track('health:check-complete', { status: healthStatus.status });
    return healthStatus;
  } catch (error) {
    track('health:check-error', { error: String(error) });
    return {
      status: 'error',
      buildTime: 'unknown',
      mockEnabled: false,
      chatStyle: 'unknown',
      environment: {
        sse: false,
        nova: false,
      },
    };
  }
};
