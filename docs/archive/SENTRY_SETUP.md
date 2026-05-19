# Sentry Error Tracking Setup

## Quick Setup (10 minutes)

### **1. Create Sentry Account**
1. Go to [sentry.io](https://sentry.io/)
2. Sign up / Log in
3. Create new project
4. Select "React" as platform
5. Copy your DSN (looks like: `https://xxxxx@xxx.ingest.sentry.io/xxxxx`)

---

### **2. Install Sentry Package**

```bash
npm install @sentry/react
```

---

### **3. Add Environment Variable**

**.env**
```bash
VITE_SENTRY_DSN=https://xxxxx@xxx.ingest.sentry.io/xxxxx
VITE_SENTRY_ENABLED=true
```

**Netlify/Vercel**
Add the same variables in your hosting dashboard.

---

### **4. Initialize Sentry**

Create `/src/utils/sentry.ts`:

```typescript
import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const SENTRY_ENABLED = import.meta.env.VITE_SENTRY_ENABLED === 'true';
const IS_PRODUCTION = import.meta.env.PROD;

export function initSentry() {
  if (!SENTRY_ENABLED || !SENTRY_DSN) {
    console.log('[Sentry] Disabled or DSN missing');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: IS_PRODUCTION ? 'production' : 'development',

    // Only send errors in production
    enabled: IS_PRODUCTION,

    // Performance monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance sampling
    tracesSampleRate: IS_PRODUCTION ? 0.1 : 1.0,

    // Session replay sampling
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Filter errors
    beforeSend(event, hint) {
      // Don't send canceled requests
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'name' in error) {
        if (error.name === 'AbortError') return null;
        if (error.name === 'CanceledError') return null;
      }

      return event;
    },
  });
}

export { Sentry };
```

---

### **5. Add to Main Entry**

Update `/src/main.tsx`:

```typescript
import { initSentry } from './utils/sentry';

// Initialize Sentry FIRST
initSentry();

// Then render app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

### **6. Wrap Error Boundaries**

Update `/src/components/ErrorBoundary.tsx`:

```typescript
import { Sentry } from '@/utils/sentry';

export class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Send to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    // Your existing error handling...
  }
}
```

---

### **7. Manual Error Tracking**

In your code, you can manually track errors:

```typescript
import { Sentry } from '@/utils/sentry';

try {
  // risky operation
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: 'outfit-generation',
    },
    contexts: {
      user: {
        email: user.email,
        profileComplete: user.hasCompletedQuiz,
      },
    },
  });

  // Show user-friendly message
  toast.error('Er ging iets mis');
}
```

---

### **8. Track Custom Events**

```typescript
// Track key user actions
Sentry.captureMessage('User completed quiz', {
  level: 'info',
  tags: {
    feature: 'onboarding',
  },
});

// Track performance
Sentry.startTransaction({
  name: 'Outfit Generation',
  op: 'recommendation',
});
```

---

## Configuration Best Practices

### **Privacy-First Settings**

```typescript
Sentry.init({
  // Mask sensitive data
  beforeSend(event) {
    // Remove email from error data
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },

  // Block sensitive URLs
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],

  denyUrls: [
    /extensions\//i,
    /^chrome:\/\//i,
  ],
});
```

---

### **Performance Monitoring**

```typescript
// Trace user interactions
const transaction = Sentry.startTransaction({
  name: 'Photo Upload',
  op: 'user-interaction',
});

try {
  await uploadPhoto(file);
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  Sentry.captureException(error);
} finally {
  transaction.finish();
}
```

---

## Testing Sentry

### **1. Test in Development**

```typescript
// In browser console
import { Sentry } from './utils/sentry';

// Trigger test error
Sentry.captureException(new Error('Test error from FitFi'));

// Check your Sentry dashboard for the error
```

---

### **2. Test Error Boundary**

```typescript
// Create a component that throws
const BrokenComponent = () => {
  throw new Error('Test error boundary');
  return <div>Never reached</div>;
};

// Add to your app temporarily
// Should see error in Sentry + user sees fallback UI
```

---

## Monitoring Checklist

After deployment, verify:

- [ ] Errors appear in Sentry dashboard
- [ ] Source maps uploaded (for readable stack traces)
- [ ] User feedback collected
- [ ] Performance traces recorded
- [ ] Session replays working

---

## Alerts Setup

1. Go to Sentry → Alerts
2. Create alert: "High error rate"
   - Condition: >10 errors in 5 minutes
   - Action: Email/Slack notification
3. Create alert: "New error type"
   - Condition: First seen error
   - Action: Immediate notification

---

## Cost Management

**Free Tier:** 5,000 errors/month
**Developer:** $26/month - 50,000 errors

**Tips to stay under limit:**
- Filter noisy errors (extensions, resize observer)
- Sample traces at 10% in production
- Use `beforeSend` to filter duplicates

---

## Alternative: LogRocket

If you want session replay without Sentry:

```bash
npm install logrocket
```

```typescript
import LogRocket from 'logrocket';

LogRocket.init('your-app/fitfi');

// Identify users
LogRocket.identify(user.id, {
  email: user.email,
  subscription: user.tier,
});
```

---

## Need Help?

- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Discord](https://discord.gg/sentry)

---

**Estimated Setup Time:** 10-15 minutes
**Value:** Instant visibility into production errors
