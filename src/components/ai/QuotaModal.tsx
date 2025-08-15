import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Sparkles, Users, ArrowRight } from 'lucide-react';
import type { FitfiTier } from '@/config/novaAccess';
import { getUsageStats } from '@/utils/session';
import Button from '@/components/ui/Button';

export default function QuotaModal({
  tier, onClose, userId,
}: { tier: FitfiTier; onClose: () => void; userId?: string }) {
  const isVisitor = tier === 'visitor';
  const stats = userId ? getUsageStats(tier, userId) : null;
  
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-[92vw] max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-2xl font-medium text-gray-900 mb-2">
            {isVisitor ? 'Ontgrendel Nova AI' : 'Upgrade voor meer Nova'}
          </h3>
          
          <p className="text-gray-600">
            {isVisitor
              ? 'Maak gratis een account aan om outfit aanbevelingen te ontgrendelen.'
              : 'Je dagelijkse limiet is bereikt. Upgrade naar Plus voor onbeperkt stijladvies.'}
          </p>
        </div>
        
        {/* Usage Stats */}
        {stats && !isVisitor && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Jouw Nova gebruik:</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Vandaag:</span>
                <span className="font-medium">{stats.daily.used}/{stats.daily.limit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#89CFF0] h-2 rounded-full transition-all"
                  style={{ width: `${(stats.daily.used / stats.daily.limit) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Benefits Preview */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">
            {isVisitor ? 'Als member krijg je:' : 'Met Plus krijg je:'}
          </h4>
          <div className="space-y-2">
            {isVisitor ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">2 Nova gesprekken per dag</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-gray-700">Toegang tot Style Tribes</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                    <Crown className="w-3 h-3 text-purple-600" />
                  </div>
                  <span className="text-gray-700">Onbeperkte Nova gesprekken</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-orange-600" />
                  </div>
                  <span className="text-gray-700">Alle Nova modes (outfits, archetype, shop)</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          {isVisitor
            ? 'Maak gratis een account aan om outfits te ontgrendelen.'
            : 'Je limiet is bereikt. Upgrade naar Plus voor onbeperkt stijladvies.'}
        </p>
        <div className="mt-5 flex gap-3">
          {isVisitor ? (
            <>
              <Button
                as={Link}
                to="/registreren"
                variant="primary"
                size="lg"
                fullWidth
                icon={<ArrowRight size={20} />}
                iconPosition="right"
                className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
              >
                Gratis member worden
              </Button>
              <Button
                as={Link}
                to="/inloggen"
                variant="outline"
                size="lg"
                fullWidth
                className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
              >
                Ik heb al een account
              </Button>
            </>
          ) : (
            <>
              <Button
                as={Link}
                to="/prijzen"
                variant="primary"
                size="lg"
                fullWidth
                icon={<Crown size={20} />}
                iconPosition="left"
                className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
              >
                Upgrade naar Plus
              </Button>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={onClose}
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Sluiten
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}