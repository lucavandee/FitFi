import React, { useState } from 'react';
import { DUTCH_ARCHETYPES, getArchetypeOptions } from '../config/profile-mapping.js';

const ProfileSelector = ({ selectedProfile, onProfileChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = getArchetypeOptions();
  
  const selectedOption = options.find(option => option.value === selectedProfile);

  const handleSelect = (option) => {
    onProfileChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-3">
          {selectedOption ? (
            <>
              <span className="text-xl">{selectedOption.icon}</span>
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-white">
                  {selectedOption.label}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {selectedOption.description}
                </div>
              </div>
            </>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">Selecteer je stijl...</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedProfile === option.value 
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' 
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              <span className="text-xl">{option.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {option.description}
                </div>
              </div>
              {selectedProfile === option.value && (
                <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileSelector;