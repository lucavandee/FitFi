import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Mail, Clock } from 'lucide-react';

const ThankYouPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F0EB] flex items-center justify-center px-4 py-24">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 md:p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-[#F4E8E3] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-[#C2654A]" />
          </div>

          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-3">
            Bedankt voor je bericht!
          </h1>

          <p className="text-[#4A4A4A] text-base mb-8 leading-relaxed">
            We hebben je bericht ontvangen en waarderen je contact.
            Ons team neemt binnen 24 uur contact met je op.
          </p>

          <div className="space-y-3 mb-8">
            <div className="bg-[#F5F0EB] rounded-xl p-4 flex items-center gap-3 text-left">
              <Clock className="w-5 h-5 text-[#C2654A] flex-shrink-0" />
              <div>
                <p className="font-semibold text-[#1A1A1A] text-sm">Reactietijd</p>
                <p className="text-[#4A4A4A] text-sm">Binnen 24 uur op werkdagen</p>
              </div>
            </div>

            <div className="bg-[#F5F0EB] rounded-xl p-4 flex items-center gap-3 text-left">
              <Mail className="w-5 h-5 text-[#C2654A] flex-shrink-0" />
              <div>
                <p className="font-semibold text-[#1A1A1A] text-sm">Bevestiging</p>
                <p className="text-[#4A4A4A] text-sm">Check je inbox voor een bevestiging</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-3 px-6 rounded-xl transition-colors duration-200"
            >
              Terug naar home
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/blog"
              className="flex items-center justify-center w-full bg-white border border-[#E5E5E5] hover:border-[#C2654A] text-[#1A1A1A] font-medium text-base py-3 px-6 rounded-xl transition-colors duration-200"
            >
              Lees onze blog
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E5E5E5]">
            <p className="text-[#8A8A8A] text-sm mb-3">
              Urgente vraag? Neem direct contact op:
            </p>
            <a
              href="mailto:info@fitfi.ai"
              className="text-[#C2654A] hover:text-[#A8513A] text-sm font-medium transition-colors duration-200"
            >
              info@fitfi.ai
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
