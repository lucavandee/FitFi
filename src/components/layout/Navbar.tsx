import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/context/UserContext';
import { Button } from '@/components/ui/Button';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link to="/" className="ff-brand flex items-center space-x-2 group" aria-label="FitFi homepage">
            <Logo className="h-8 w-auto" textColor="text-[#0D1B2A]" />
          </Link>

          {/* Desktop Navigation */}
        {/* rechts: (houd je bestaande links/knoppen hier) */}
        <div className="flex items-center gap-6">
          {/* /* placeholder removed */ jouw links /* placeholder removed */ */}
        </div>
        </div>
      navigate('/login?redirect=' + encodeURIComponent(location.pathname));
    }
    </header>
  );
}
  )
}