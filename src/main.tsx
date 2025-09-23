// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';

// Base + tokens (moeten ALTIJD eerst)
import '@/styles/polish/00-tokens.css';
import '@/styles/polish/10-base.css';

// Layout & utilities
import '@/styles/polish/20-layout.css';
import '@/styles/polish/25-utilities.css';

// Componenten
import '@/styles/polish/30-buttons.css';
import '@/styles/polish/31-chips.css';
import '@/styles/polish/32-cards.css';
import '@/styles/polish/33-badges.css';

// Pagina-secties
import '@/styles/polish/40-hero.css';
import '@/styles/polish/50-results.css';
import '@/styles/polish/60-pricing.css';
import '@/styles/polish/70-how-it-works.css';
import '@/styles/polish/80-faq.css';
import '@/styles/polish/90-blog.css';

// Header/Footer polish & overrides
import { BrowserRouter } from "react-router-dom";
import '@/styles/polish/95-header-footer.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
)
)