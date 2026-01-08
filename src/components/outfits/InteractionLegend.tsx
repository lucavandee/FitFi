/**
 * InteractionLegend Component
 *
 * Help modal explaining all outfit card interaction buttons.
 * Shows icon meanings, keyboard shortcuts, and gestures.
 *
 * Prevents user confusion by providing a visual guide.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  ShoppingBag,
  Share2,
  Star,
  Sparkles,
  HelpCircle,
  X,
  ChevronRight,
  Smartphone,
  Monitor
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface InteractionLegendProps {
  isOpen: boolean;
  onClose: () => void;
  /** Show mobile-specific instructions */
  showMobileInstructions?: boolean;
  /** Show keyboard shortcuts */
  showKeyboardShortcuts?: boolean;
}

interface ActionItem {
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  keyboard?: string;
  mobileGesture?: string;
}

const ACTIONS: ActionItem[] = [
  {
    icon: Heart,
    label: 'Bewaar outfit',
    description: 'Voeg dit outfit toe aan je favorieten om later terug te vinden',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    keyboard: 'S',
    mobileGesture: 'Tap op het hart-icoon'
  },
  {
    icon: ThumbsUp,
    label: 'Meer zoals dit',
    description: 'Toon vergelijkbare outfits op basis van deze stijl, kleuren en gelegenheid',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    keyboard: 'L',
    mobileGesture: 'Swipe rechts of tap op duim omhoog'
  },
  {
    icon: ThumbsDown,
    label: 'Niet mijn stijl',
    description: 'Verberg dit type outfit uit je feed en verfijn je aanbevelingen',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    keyboard: 'D',
    mobileGesture: 'Swipe links of tap op duim omlaag'
  },
  {
    icon: MessageCircle,
    label: 'Nova uitleg',
    description: 'Laat Nova uitleggen waarom dit outfit bij jouw stijlprofiel past',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    keyboard: 'E',
    mobileGesture: 'Tap op het chat-icoon'
  },
  {
    icon: ShoppingBag,
    label: 'Shop deze look',
    description: 'Bekijk en shop individuele items uit dit outfit bij retailers',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    keyboard: 'Enter',
    mobileGesture: 'Tap op het winkelmandje'
  },
  {
    icon: Share2,
    label: 'Deel outfit',
    description: 'Deel dit outfit met vrienden via WhatsApp, e-mail of social media',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    keyboard: 'Shift+S',
    mobileGesture: 'Tap op het deel-icoon'
  },
  {
    icon: Star,
    label: 'Beoordeel outfit',
    description: 'Geef sterren (1-5) om je toekomstige aanbevelingen te verbeteren',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    keyboard: '1-5',
    mobileGesture: 'Tap op het ster-icoon'
  }
];

const BADGES: ActionItem[] = [
  {
    icon: Sparkles,
    label: 'Match Score',
    description: 'Geeft aan hoe goed dit outfit past bij jouw stijlprofiel (archetype, kleur, seizoen)',
    color: 'text-blue-600',
    bgColor: 'bg-gradient-to-r from-blue-50 to-purple-50'
  },
  {
    icon: Sparkles,
    label: 'Kleurharmonie',
    description: 'Toont hoe goed de kleuren in dit outfit samen harmoniseren',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    icon: HelpCircle,
    label: 'Seizoen Label',
    description: 'Geeft aan voor welk kleurseizoen (lente/zomer/herfst/winter) dit outfit geschikt is',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50'
  }
];

export function InteractionLegend({
  isOpen,
  onClose,
  showMobileInstructions = true,
  showKeyboardShortcuts = true
}: InteractionLegendProps) {
  const [activeTab, setActiveTab] = useState<'buttons' | 'badges' | 'gestures'>('buttons');

  // Detect if user is on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative max-w-2xl w-full max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Interactie Handleiding</h2>
                  <p className="text-sm text-white/80">Leer hoe je outfits kunt bedienen</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Sluit handleiding"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('buttons')}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                    activeTab === 'buttons'
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'text-white/80 hover:bg-white/10'
                  )}
                >
                  Knoppen
                </button>
                <button
                  onClick={() => setActiveTab('badges')}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                    activeTab === 'badges'
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'text-white/80 hover:bg-white/10'
                  )}
                >
                  Badges
                </button>
                {showMobileInstructions && (
                  <button
                    onClick={() => setActiveTab('gestures')}
                    className={cn(
                      'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                      activeTab === 'gestures'
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'text-white/80 hover:bg-white/10'
                    )}
                  >
                    Gebaren
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
              {/* Buttons Tab */}
              {activeTab === 'buttons' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    {isMobile ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                    <span>
                      {isMobile
                        ? 'Tap op de knoppen om te gebruiken'
                        : 'Klik op de knoppen of gebruik toetsenbord shortcuts'}
                    </span>
                  </div>

                  {ACTIONS.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <motion.div
                        key={action.label}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {/* Icon */}
                        <div className={cn('p-3 rounded-lg flex-shrink-0', action.bgColor)}>
                          <Icon className={cn('w-6 h-6', action.color)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{action.label}</h3>
                            {showKeyboardShortcuts && action.keyboard && !isMobile && (
                              <kbd className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-mono">
                                {action.keyboard}
                              </kbd>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{action.description}</p>
                          {isMobile && action.mobileGesture && (
                            <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                              <Smartphone className="w-3 h-3" />
                              <span>{action.mobileGesture}</span>
                            </div>
                          )}
                        </div>

                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Badges Tab */}
              {activeTab === 'badges' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Badges geven extra informatie over het outfit. Hover (desktop) of tap (mobiel) om details te zien.
                  </p>

                  {BADGES.map((badge, index) => {
                    const Icon = badge.icon;
                    return (
                      <motion.div
                        key={badge.label}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {/* Icon */}
                        <div className={cn('p-3 rounded-lg flex-shrink-0', badge.bgColor)}>
                          <Icon className={cn('w-6 h-6', badge.color)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">{badge.label}</h3>
                          <p className="text-sm text-gray-600">{badge.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Example Badges */}
                  <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-3">Voorbeeld badges:</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-sm font-medium text-gray-900 shadow-sm">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Match 85%
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-sm font-medium text-purple-600 shadow-sm">
                        🎨 Perfecte kleurcombinatie
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-sm font-medium text-teal-600 shadow-sm">
                        Lente
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Gestures Tab */}
              {activeTab === 'gestures' && (
                <div className="space-y-6">
                  <p className="text-sm text-gray-600">
                    Op mobiel kun je swipe-gebaren gebruiken voor snelle interactie met outfits.
                  </p>

                  {/* Swipe Right */}
                  <motion.div
                    className="p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="p-3 bg-green-600 text-white rounded-full">
                        <ThumbsUp className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-green-900">Swipe Rechts 👉</h3>
                        <p className="text-sm text-green-700">Vind ik leuk / Meer zoals dit</p>
                      </div>
                    </div>
                    <div className="text-sm text-green-700">
                      Veeg de outfit naar rechts om aan te geven dat je meer van dit type outfits wilt zien.
                    </div>
                  </motion.div>

                  {/* Swipe Left */}
                  <motion.div
                    className="p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-xl"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="p-3 bg-red-600 text-white rounded-full">
                        <ThumbsDown className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-red-900">Swipe Links 👈</h3>
                        <p className="text-sm text-red-700">Niet mijn stijl</p>
                      </div>
                    </div>
                    <div className="text-sm text-red-700">
                      Veeg de outfit naar links om aan te geven dat je dit type outfits niet wilt zien.
                    </div>
                  </motion.div>

                  {/* Long Press */}
                  <motion.div
                    className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="p-3 bg-blue-600 text-white rounded-full">
                        <HelpCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-blue-900">Lang Indrukken 👆</h3>
                        <p className="text-sm text-blue-700">Toon tooltip</p>
                      </div>
                    </div>
                    <div className="text-sm text-blue-700">
                      Druk lang (500ms) op een knop om een tooltip te zien met meer informatie over de functie.
                    </div>
                  </motion.div>

                  {/* Tips */}
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-amber-900 mb-1">💡 Tips</h4>
                        <ul className="text-sm text-amber-800 space-y-1">
                          <li>• Swipe met een snelle beweging voor betere detectie</li>
                          <li>• Je voelt een korte trilling wanneer een swipe wordt herkend</li>
                          <li>• Swipe minimaal 100px voor activering</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Nog vragen? Neem contact op via support.</span>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Begrepen!
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Trigger button to open InteractionLegend
 */
export function InteractionLegendButton({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors text-sm font-medium',
          className
        )}
        aria-label="Open interactie handleiding"
      >
        <HelpCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Uitleg knoppen</span>
        <span className="sm:hidden">Help</span>
      </button>

      <InteractionLegend isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
