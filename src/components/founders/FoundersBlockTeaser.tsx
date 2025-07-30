import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Crown, Users, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

interface FoundersBlockTeaserProps {
  className?: string;
}

const FoundersBlockTeaser: React.FC<FoundersBlockTeaserProps> = ({ className = '' }) => {
  return (
    <section className={`max-w-4xl mx-auto ${className}`} aria-labelledby="founders-teaser-heading">
      <div className="bg-white shadow-md rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-brandPurple to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <Rocket className="w-8 h-8 text-white" />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 text-center md:text-left">
          <h3 id="founders-teaser-heading" className="text-xl font-semibold text-gray-900 mb-2">
            Word FitFi Founding Member
          </h3>
          <p className="text-sm text-slate-600 mb-4 md:mb-0">
            Nodig 3 vrienden uit en ontgrendel exclusieve early-access voordelen, 
            speciale community events en je persoonlijke Founding Member badge.
          </p>
          
          {/* Benefits Preview */}
          <div className="flex items-center justify-center md:justify-start space-x-4 mt-3 text-xs text-slate-500">
            <div className="flex items-center space-x-1">
              <Crown className="w-3 h-3 text-brandPurple" />
              <span>Exclusieve badge</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3 text-brandPurple" />
              <span>Community events</span>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="flex-shrink-0">
          <Button 
            as={Link} 
            to="/dashboard" 
            variant="outline"
            className="border-brandPurple text-brandPurple hover:bg-brandPurple hover:text-white transition-all duration-300"
            icon={<ArrowRight size={16} />}
            iconPosition="right"
          >
            Bekijk voortgang
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FoundersBlockTeaser;