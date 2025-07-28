import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const ResultsPage: React.FC = () => {

  return (
    <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Resultaten</h1>
        <p className="text-gray-600 mb-6">Coming soon - Hier komen je stijlaanbevelingen</p>
        <div className="space-y-4">
          <Button as={Link} to="/dashboard" variant="primary" fullWidth>
            Ga naar Dashboard
          </Button>
          <Button as={Link} to="/onboarding" variant="outline" fullWidth>
            Quiz opnieuw doen
          </Button>
          <Button as={Link} to="/" variant="ghost" fullWidth>
            Terug naar Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;