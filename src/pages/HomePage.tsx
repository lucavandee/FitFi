import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';

const HomePage: React.FC = () => {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto p-8">
        <div className="w-20 h-20 bg-[#bfae9f] rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
          Welkom bij FitFi
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Ontdek jouw perfecte stijl met AI-powered personal styling
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
                className="bg-[#bfae9f] hover:bg-[#a89a8c] text-white"
              >
                Ga naar Dashboard
              </Button>
              <p className="text-gray-500">
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
  );
};

export default HomePage;