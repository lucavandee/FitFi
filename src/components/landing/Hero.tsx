import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import Container from '@/components/layout/Container';
import SmartImage from '@/components/media/SmartImage';
import { track } from '@/utils/analytics';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleCTAClick = () => {
    track('cta_click', { location: 'hero', action: 'start_quiz' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-purple-200/25 to-pink-200/25 rounded-full blur-3xl animate-float-slow" />
      </div>

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              AI-Powered Styling
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Ontdek je
                <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  perfecte stijl
                </span>
                met AI
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Persoonlijke styling-adviezen op basis van je voorkeuren, lichaamsbouw en lifestyle. 
                Geen dure stylisten meer nodig.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>10.000+ tevreden gebruikers</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>Nederlandse startup</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/quiz"
                onClick={handleCTAClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start gratis stijltest
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link
                to="/hoe-het-werkt"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Hoe het werkt
              </Link>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative">
              {/* Glow effect behind image */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-3xl blur-2xl transform scale-105" />
              
              {/* Main hero image */}
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
                <SmartImage
                  src="/hero/style-report.webp"
                  alt="FitFi AI Style Report - Persoonlijke styling adviezen"
                  className="w-full h-auto"
                  loading="eager"
                  priority
                />
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-lg animate-bounce-slow flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg animate-pulse flex items-center justify-center">
                <Award className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}