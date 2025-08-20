import React, { useState } from 'react';
import { Calendar, Trophy, Users, Image, Type, Clock } from 'lucide-react';
import type { TribeChallenge } from '../../services/data/types';
import Button from '../ui/Button';

interface ChallengeAdminFormProps {
  tribeId: string;
  onCreate: (challengeData: Omit<TribeChallenge, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
}

export const ChallengeAdminForm: React.FC<ChallengeAdminFormProps> = ({
  tribeId,
  onCreate,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    startDate: '',
    endDate: '',
    maxParticipants: '',
    xpReward: '15',
    status: 'draft' as const
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const challengeData: Omit<TribeChallenge, 'id' | 'createdAt'> = {
        tribeId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl.trim() || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        xpReward: parseInt(formData.xpReward) || 15,
        status: formData.status
      };

      await onCreate(challengeData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        startDate: '',
        endDate: '',
        maxParticipants: '',
        xpReward: '15',
        status: 'draft'
      });
    } catch (error) {
      console.error('Challenge creation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-medium text-gray-900">
            Nieuwe Challenge Maken
          </h3>
          <p className="text-gray-600 text-sm">
            Maak een nieuwe challenge voor deze tribe
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Type className="w-4 h-4 inline mr-1" />
              Challenge Titel *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Bijv. 'Laat je winter outfit zien'"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#89CFF0] focus:border-transparent"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beschrijving *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Beschrijf wat deelnemers moeten doen..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#89CFF0] focus:border-transparent resize-none"
              rows={4}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Image className="w-4 h-4 inline mr-1" />
              Challenge Afbeelding (optioneel)
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              placeholder="https://example.com/challenge-image.jpg"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#89CFF0] focus:border-transparent"
            />
          </div>
        </div>

        {/* Timing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Datum (optioneel)
            </label>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#89CFF0] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Eind Datum (optioneel)
            </label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#89CFF0] focus:border-transparent"
            />
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Max Deelnemers (optioneel)
            </label>
            <input
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
              placeholder="Geen limiet"
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#89CFF0] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Trophy className="w-4 h-4 inline mr-1" />
              XP Beloning
            </label>
            <input
              type="number"
              value={formData.xpReward}
              onChange={(e) => handleInputChange('xpReward', e.target.value)}
              min="1"
              max="100"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#89CFF0] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#89CFF0] focus:border-transparent"
            >
              <option value="draft">Concept</option>
              <option value="open">Actief</option>
              <option value="closed">Gesloten</option>
              <option value="archived">Gearchiveerd</option>
            </select>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            size="lg"
            disabled={isSubmitting}
          >
            Annuleren
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
            disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
            loading={isSubmitting}
          >
            {isSubmitting ? 'Challenge Maken...' : 'Maak Challenge'}
          </Button>
        </div>
      </form>
    </div>
  );
};