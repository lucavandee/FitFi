import React, { useState } from 'react';
import { Palette, Save } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import Button from '../ui/Button';

const StylePreferences: React.FC = () => {
  const { user, updateProfile } = useUser();
  const [preferences, setPreferences] = useState(user?.stylePreferences || {
    casual: 3,
    formal: 3,
    sporty: 3,
    vintage: 3,
    minimalist: 3
  });
  const [isSaving, setIsSaving] = useState(false);

  const handlePreferenceChange = (style: string, value: number) => {
    setPreferences(prev => ({
      ...prev,
      [style]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ stylePreferences: preferences });
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const styleDescriptions = {
    casual: 'Comfortabel en relaxed voor dagelijks gebruik',
    formal: 'Elegant en professioneel voor zakelijke gelegenheden',
    sporty: 'Actief en functioneel voor sport en beweging',
    vintage: 'Retro en nostalgisch met een unieke uitstraling',
    minimalist: 'Clean en simpel met focus op essentiële stukken'
  };

  return (
    <div className="space-y-6">
      <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-secondary mb-6 flex items-center">
          <Palette className="mr-3" size={24} />
          Stijlvoorkeuren
        </h2>
        
        <p className="text-gray-600 mb-8">
          Pas je stijlvoorkeuren aan om nog betere aanbevelingen te krijgen. 
          Gebruik de sliders om aan te geven hoe belangrijk elke stijl voor je is.
        </p>
        
        <div className="space-y-6">
          {Object.entries(preferences).map(([style, value]) => (
            <div key={style} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium capitalize">{style}</h3>
                  <p className="text-sm text-gray-600">
                    {styleDescriptions[style as keyof typeof styleDescriptions]}
                  </p>
                </div>
                <span className="text-lg font-bold text-secondary">{value}</span>
              </div>
              
              <input
                type="range"
                min="1"
                max="5"
                value={value}
                onChange={(e) => handlePreferenceChange(style, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #89CFF0 0%, #89CFF0 ${(value / 5) * 100}%, #E5E7EB ${(value / 5) * 100}%, #E5E7EB 100%)`
                }}
              />
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>Niet belangrijk</span>
                <span>Zeer belangrijk</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            icon={<Save size={16} />}
            iconPosition="left"
            className="w-full md:w-auto"
          >
            {isSaving ? 'Opslaan...' : 'Voorkeuren opslaan'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StylePreferences;