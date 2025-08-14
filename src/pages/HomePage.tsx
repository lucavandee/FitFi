import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import Seo from '@/components/Seo';
import Button from '../components/ui/Button';
import HeroTitle from '@/components/marketing/HeroTitle';
import { useUser } from '../context/UserContext';

const HomePage: React.FC = () => {
  const { user } = useUser();

  return (
    <>
      <Seo 
        title="FitFi - AI-Powered Personal Styling Platform"
        description="Ontdek jouw perfecte stijl met AI-powered personal styling. Gepersonaliseerde outfit aanbevelingen, stijlquiz en fashion advies."
        canonical="https://fitfi.app/home"
        keywords="AI personal stylist, outfit aanbevelingen, stijl quiz, fashion advies, Nederlandse mode platform"
      />
    <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
      <div className="not-prose text-center max-w-2xl mx-auto p-8">
        <div className="w-20 h-20 bg-[#bfae9f] rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        
        <div className="mb-6">
          <HeroTitle
            lines={[
              'Ontdek wat',
              'jouw stijl',
              'over je zegt',
            ]}
            accents={{
              1: [
                { word: 'jouw', className: 'text-gradient-soft', onlyFirst: true },
                { word: 'stijl', className: 'text-gradient accent-bump', onlyFirst: true },
              ],
            }}
            className="text-[#0D1B2A]"
            balance
          />
        </div>
        
        <p className="copy-muted text-lg md:text-xl mt-4 max-w-2xl mx-auto mb-8 leading-relaxed">
          Krijg in 2 minuten een gepersonaliseerd AI-rapport dat onthult hoe jouw kledingkeuzes 
          jouw persoonlijkheid weerspiegelen en hoe je dit kunt gebruiken om jouw doelen te bereiken.
        </p>
        
        <div className="space-y-4">
          {user ? (
            <>
              <Button 
                as={Link}
                to="/dashboard" 
                variant="primary"
                size="lg"
                icon={<ArrowRight size={20} />}
                iconPosition="right"
              >
                Ga naar Dashboard
              </Button>
              <p className="copy-muted text-lg md:text-xl mt-4 max-w-2xl mx-auto mb-8 leading-relaxed">
                Welkom terug, {user.name}!
              </p>
            </>
          ) : (
            <>
              <Button 
                as={Link}
                to="/registreren" 
                variant="primary"
                size="lg"
                icon={<ArrowRight size={20} />}
                iconPosition="right"
                className="bg-[#bfae9f] hover:bg-[#a89a8c] text-white"
              >
                Start nu gratis
              </Button>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                <Button 
                  as={Link}
                  to="/inloggen" 
                  variant="outline"
                  className="border-[#bfae9f] text-[#bfae9f] hover:bg-[#bfae9f] hover:text-white"
                >
                  Inloggen
                </Button>
                <Button 
                  as={Link}
                  to="/hoe-het-werkt" 
                  variant="ghost"
                  className="text-gray-600 hover:bg-gray-50"
                >
                  Hoe het werkt
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default HomePage;