import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';

// Providers
import { UserProvider } from '@/context/UserContext';
import { GamificationProvider } from '@/context/GamificationContext';
import { NovaChatProvider } from '@/components/nova/NovaChatProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <UserProvider>
          <GamificationProvider>
            <NovaChatProvider>
              <App />
            </NovaChatProvider>
          </GamificationProvider>
        </UserProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);