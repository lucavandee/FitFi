import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { configureRouterFutureFlags } from './utils/routerUtils';
import { initializeSentry } from './utils/sentryConfig';
import './styles/main.css';

// Configure React Router future flags to suppress warnings
configureRouterFutureFlags();

// Initialize Sentry
initializeSentry();

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
