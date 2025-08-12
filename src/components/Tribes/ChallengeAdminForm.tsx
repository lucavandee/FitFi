import React, { useState } from "react";
import { Plus, Calendar, Image, FileText, Award, X } from "lucide-react";
import type { TribeChallenge } from "@/services/data/types";
import Button from "../ui/Button";
import toast from "react-hot-toast";

interface ChallengeAdminFormProps {
  tribeId: string;
  onCreate: (challenge: Omit<TribeChallenge, 'id' | 'createdAt'>) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export const ChallengeAdminForm: React.FC<ChallengeAdminFormProps> = ({ 
  tribeId, 
  onCreate, 
  onCancel,
  className = '' 
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    rules: [""],
    rewardPoints: 50,
    winnerRewardPoints: 150,
    startAt: "",
    endAt: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    tags: ""
  });
  const [busy, setBusy] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, ""]
    }));
  };

  const updateRule = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => i === index ? value : rule)
    }));
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Titel is verplicht");
      return;
    }

    setBusy(true);
    
    try {
      const challenge: Omit<TribeChallenge, 'id' | 'createdAt'> = {
        tribeId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        image: formData.image.trim() || undefined,
        rules: formData.rules.filter(rule => rule.trim()).map(rule => rule.trim()),
        rewardPoints: formData.rewardPoints,
        winnerRewardPoints: formData.winnerRewardPoints,
        startAt: formData.startAt ? new Date(formData.startAt).toISOString() : undefined,
        endAt: formData.endAt ? new Date(formData.endAt).toISOString() : undefined,
        status: "draft", // Start as draft
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        difficulty: formData.difficulty,
        createdBy: "admin-ui"
      };
      
      await onCreate(challenge);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        image: "",
        rules: [""],
        rewardPoints: 50,
        winnerRewardPoints: 150,
        startAt: "",
        endAt: "",
        difficulty: "medium",
        tags: ""
      });
      
      toast.success("Challenge succesvol aangemaakt! 🎯");
    } catch (error) {
      console.error("Challenge creation failed:", error);
      toast.error("Challenge aanmaken mislukt. Probeer opnieuw.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-900">Nieuwe Challenge</h3>
            <p className="text-gray-600 text-sm">Maak een nieuwe challenge voor deze tribe</p>
          </div>
        </div>
        
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            icon={<X size={16} />}
            className="text-gray-600 hover:bg-gray-100"
          >
            Annuleren
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titel *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors"
              placeholder="Bijv. Winter Layering Challenge"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => handleInputChange('difficulty', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Beschrijving
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors resize-none"
            placeholder="Beschrijf wat deelnemers moeten doen..."
            rows={3}
          />
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Image size={16} className="inline mr-1" />
            Afbeelding URL
          </label>
          <input
            type="url"
            value={formData.image}
            onChange={(e) => handleInputChange('image', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors"
            placeholder="https://images.pexels.com/..."
          />
        </div>

        {/* Rules */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText size={16} className="inline mr-1" />
            Challenge Regels
          </label>
          <div className="space-y-2">
            {formData.rules.map((rule, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={rule}
                  onChange={(e) => updateRule(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors"
                  placeholder={`Regel ${index + 1}`}
                />
                {formData.rules.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRule(index)}
                    icon={<X size={14} />}
                    className="text-red-600 hover:bg-red-50"
                  />
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRule}
              icon={<Plus size={14} />}
              iconPosition="left"
              className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
            >
              Regel toevoegen
            </Button>
          </div>
        </div>

        {/* Rewards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Award size={16} className="inline mr-1" />
              Deelname Punten
            </label>
            <input
              type="number"
              value={formData.rewardPoints}
              onChange={(e) => handleInputChange('rewardPoints', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors"
              min="0"
              max="1000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Winnaar Bonus
            </label>
            <input
              type="number"
              value={formData.winnerRewardPoints}
              onChange={(e) => handleInputChange('winnerRewardPoints', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors"
              min="0"
              max="1000"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Start Datum
            </label>
            <input
              type="datetime-local"
              value={formData.startAt}
              onChange={(e) => handleInputChange('startAt', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Eind Datum
            </label>
            <input
              type="datetime-local"
              value={formData.endAt}
              onChange={(e) => handleInputChange('endAt', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (komma gescheiden)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors"
            placeholder="winter, layering, italian, smart-casual"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={busy || !formData.title.trim()}
            className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] disabled:opacity-50 disabled:cursor-not-allowed"
            icon={busy ? undefined : <Plus size={16} />}
            iconPosition="left"
          >
            {busy ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-[#0D1B2A] border-t-transparent rounded-full animate-spin"></div>
                <span>Aanmaken...</span>
              </div>
            ) : (
              'Challenge Aanmaken'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};