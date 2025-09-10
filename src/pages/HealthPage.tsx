          },
            buildTime: 'unknown',
            mockEnabled: false,
            chatStyle: 'unknown',
          environment: {
          },
            sse: false,
            nova: false,
        track('health:check-error', { error: String(error) });
        track('health:check-complete', { status: healthStatus.status });
            buildTime: import.meta.env.VITE_BUILD_TIME || 'unknown',
            mockEnabled: import.meta.env.VITE_DEV_MOCK_NOVA === '1',
            chatStyle: import.meta.env.VITE_CHAT_STYLE || 'default',
          environment: {
          },
            sse: sseCheck,
            nova: novaCheck,
          status: dbCheck && apiCheck && sseCheck && novaCheck ? 'healthy' : 'degraded',
        // Nova mount check
        
          .catch(() => false);
          .then(r => r.headers.get('content-type')?.includes('text/event-stream'))
        const sseCheck = await fetch('/.netlify/functions/nova')
        // Nova SSE check
        
        // API check
        
        // Database check
    
    track('health:check-start');
  };
    buildTime: string;
    mockEnabled: boolean;
    chatStyle: string;
  environment: {
    sse: boolean;
    nova: boolean;
export default function HealthPage() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">OK</h1>
      <p className="opacity-70">Build & routes actief.</p>
    </main>
  );
}
import { track } from '@/utils/analytics';
