import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Mail, Clock } from 'lucide-react';
import Button from '../components/ui/Button';

const ThankYouPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-light text-gray-900 mb-4">
            Bedankt voor je bericht!
          </h1>
          
          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            We hebben je bericht ontvangen en waarderen je contact. 
            Ons team neemt binnen 24 uur contact met je op.
          </p>
          
          {/* Info Cards */}
          <div className="space-y-4 mb-8">
            <div className="bg-[#bfae9f]/10 rounded-2xl p-4 flex items-center space-x-3">
              <Clock className="w-5 h-5 text-[#bfae9f] flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-gray-900 text-sm">Reactietijd</p>
                <p className="text-gray-600 text-sm">Binnen 24 uur op werkdagen</p>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-2xl p-4 flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-gray-900 text-sm">Bevestiging</p>
                <p className="text-gray-600 text-sm">Check je inbox voor een bevestiging</p>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="space-y-4">
            <Button
              as={Link}
              to="/"
              variant="primary"
              size="lg"
              fullWidth
              icon={<ArrowRight size={20} />}
              iconPosition="right"
              className="bg-[#bfae9f] hover:bg-[#a89a8c] text-white"
            >
              Terug naar home
            </Button>
            
            <Button
              as={Link}
              to="/blog"
              variant="outline"
              size="lg"
              fullWidth
              className="border-[#bfae9f] text-[#bfae9f] hover:bg-[#bfae9f] hover:text-white"
            >
              Lees onze blog
            </Button>
          </div>
          
          {/* Additional Help */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-sm mb-4">
              Urgente vraag? Neem direct contact op:
            </p>
            <div className="flex flex-col space-y-2 text-sm">
              <a 
                href="mailto:info@fitfi.nl" 
                className="text-[#bfae9f] hover:text-[#a89a8c] transition-colors"
              >
                info@fitfi.nl
              </a>
              <a 
                href="tel:+31201234567" 
                className="text-[#bfae9f] hover:text-[#a89a8c] transition-colors"
              >
                +31 20 123 4567
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;