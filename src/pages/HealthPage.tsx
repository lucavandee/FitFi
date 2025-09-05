export default function HealthPage() {
  return (
    <pre className="ff-card text-sm">{`status: ok
service: fitfi-ui
env: ${typeof window !== 'undefined' ? (import.meta.env.MODE || 'development') : 'ssr'}
timestamp: ${new Date().toISOString()}`}</pre>
  );
}