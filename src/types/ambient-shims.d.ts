declare module "*.svg" { const src: string; export default src; }
declare module "*.png" { const src: string; export default src; }
declare module "*.jpg" { const src: string; export default src; }
declare module "*.jpeg" { const src: string; export default src; }
declare module "*.webp" { const src: string; export default src; }
declare module "*.mp4" { const src: string; export default src; }
declare module "*?raw" { const content: string; export default content; }

declare module '@/components/Dashboard/NovaInsightCard' {
  import * as React from 'react';
  const C: React.FC<any>;
  export default C;
}
declare module '@/components/Dashboard/GamificationPanel' {
  import * as React from 'react';
  const C: React.FC<any>;
  export default C;
}
declare module '@/components/analytics/HeatmapViewer' {
  import * as React from 'react';
  const C: React.FC<any>;
  export default C;
}