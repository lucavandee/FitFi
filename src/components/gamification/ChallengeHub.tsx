import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Trophy, Star, Filter, RefreshCw } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import ChallengeCard from './ChallengeCard';
import Button from '../ui/Button';
import { trackEvent } from '../../utils/analytics';

interface ChallengeHubProps {
  className?: string;
}

const ChallengeHub: React.FC<ChallengeHubProps> = ({ className = '' }) => {
  const { 
    availableChallenges, 
    availableWeeklyChallenges,
    isLoading,
    points,
    currentLevelInfo
  } = useGamification();
  
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'special'>('daily');
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Mock time calculations for demo
  const getTimeLeft = (type: string) => {
    const now = new Date();
    if (type === 'daily') {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}u ${minutes}m`;
    } else if (type === 'weekly') {
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay()));
      nextWeek.setHours(0, 0, 0, 0);
      const diff = nextWeek.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return `${days} dagen`;
    }
    return '';
  };

  const getChallengesForTab = () => {
    let challenges: any[] = [];
    
    switch (activeTab) {
      case 'daily':
        challenges = availableChallenges.map(ch => ({
          ...ch,
          timeLeft: getTimeLeft('daily'),
          progress: Math.floor(Math.random() * (ch.maxProgress || 1)),
          maxProgress: ch.maxProgress || 1
        }));
        break;
      case 'weekly':
        challenges = availableWeeklyChallenges.map(ch => ({
          ...ch,
          timeLeft: getTimeLeft('weekly'),
          progress: Math.floor(Math.random() * (ch.maxProgress || 1)),
          maxProgress: ch.maxProgress || 1
        }));
        break;
      case 'special':
        challenges = [
          {
            id: 'perfectOutfit',
            type: 'special',
            label: 'Creëer perfect outfit',
            points: 150,
            icon: '💫',
            difficulty: 'legendary',
            description: 'Maak een outfit met 95%+ match score',
            progress: 0,
            maxProgress: 1,
            timeLeft: 'Permanent'
          }
        ];
        break;
    }

    // Apply filter
    if (filter !== 'all') {
      challenges = challenges.filter(ch => ch.difficulty === filter);
    }

    return challenges;
  };

  const handleTabChange = (tab: 'daily' | 'weekly' | 'special') => {
    setActiveTab(tab);
    
    trackEvent('challenge_tab_changed', 'engagement', tab, 1, {
      previous_tab: activeTab,
      available_challenges: getChallengesForTab().length
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setRefreshing(false);
    
    trackEvent('challenges_refreshed', 'engagement', activeTab, 1);
  };

  const handleChallengeComplete = (challengeId: string) => {
    // Challenge completion is handled by the ChallengeCard component
    // This is just for additional tracking or UI updates
    console.log(`Challenge ${challengeId} completed`);
  };

  const challenges = getChallengesForTab();
  const completedToday = availableChallenges.filter(ch => ch.completed).length;
  const totalDaily = availableChallenges.length;

  return (
    <div className={`bg-white rounded-3xl shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Challenges</h2>
            <p className="text-gray-600 text-sm">
              {activeTab === 'daily' ? `${completedToday}/${totalDaily} vandaag voltooid` : 'Verdien extra punten'}
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleRefresh}
          variant="ghost"
          size="sm"
          disabled={refreshing}
          icon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
          iconPosition="left"
          className="text-gray-600 hover:bg-gray-100"
        >
          Ververs
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-xl p-1">
        {[
          { id: 'daily', label: 'Dagelijks', icon: <Calendar className="w-4 h-4" /> },
          { id: 'weekly', label: 'Wekelijks', icon: <Clock className="w-4 h-4" /> },
          { id: 'special', label: 'Speciaal', icon: <Star className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-[#89CFF0] shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-2 mb-6">
        <Filter className="w-4 h-4 text-gray-400" />
        <div className="flex space-x-1">
          {['all', 'easy', 'medium', 'hard'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption as any)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === filterOption
                  ? 'bg-[#89CFF0] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterOption === 'all' ? 'Alle' : filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Challenges Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : challenges.length > 0 ? (
          <div
            key={activeTab}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in"
          >
            {challenges.map((challenge, index) => (
              <div
                key={challenge.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ChallengeCard
                  challenge={challenge}
                  onComplete={handleChallengeComplete}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Geen challenges beschikbaar
            </h3>
            <p className="text-gray-600 mb-4">
              {filter !== 'all' 
                ? `Geen ${filter} challenges gevonden. Probeer een ander filter.`
                : 'Alle challenges voor vandaag zijn voltooid!'
              }
            </p>
            <Button
              onClick={() => setFilter('all')}
              variant="outline"
              size="sm"
              className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
            >
              Toon alle challenges
            </Button>
          </div>
        )}

      {/* Daily Progress Summary */}
      {activeTab === 'daily' && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#89CFF0]" />
              <span className="text-sm font-medium text-gray-900">Dagelijkse voortgang</span>
            </div>
            <div className="text-sm text-gray-600">
              {completedToday}/{totalDaily} voltooid
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-[#89CFF0] to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${totalDaily > 0 ? (completedToday / totalDaily) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeHub;