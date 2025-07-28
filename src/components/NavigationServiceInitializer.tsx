import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigationService } from '../services/NavigationService';

/**
 * Component that initializes the NavigationService with the navigate function
 * Must be rendered inside a Router context to access useNavigate
 */
export const NavigationServiceInitializer: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigationService.initialize(navigate);
  }, [navigate]);

  // This component doesn't render anything
  return null;
};