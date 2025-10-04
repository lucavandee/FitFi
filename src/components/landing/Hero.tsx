import { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import SmartImage from '@/components/ui/SmartImage';

const Hero = () => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-turquoise/20 to-turquoise/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-turquoise/15 to-turquoise/5 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-r from-turquoise/10 to-turquoise/5 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm">
              <Sparkles className="w-4 h-4 text-turquoise" />
              AI-Powered Styling
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-montserrat text-midnight leading-tight">
                Ontdek jouw
                <span className="block bg-gradient-to-r from-turquoise to-turquoise/80 bg-clip-text text-transparent">
                  perfecte stijl
                </span>
              </h1>
              <p className="text-xl text-gray-600 font-lato leading-relaxed max-w-lg">
                AI-powered styling advies dat perfect bij jou past. Geen dure stylisten meer nodig - krijg persoonlijke outfit aanbevelingen in seconden.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                100% Privacy-first
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Nederlandse startup
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                AI + menselijke expertise
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/quiz"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-turquoise to-turquoise/90 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 group"
              >
                Start Gratis Quiz
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-200"
              >
                Hoe het werkt
              </Link>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <SmartImage
                src="/hero/style-report.webp"
                alt="FitFi Style Report Preview"
                className={`w-full h-auto rounded-2xl shadow-2xl transition-all duration-700 ${
                  imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                onLoad={() => setImageLoaded(true)}
                loading="eager"
                priority
              />
            </div>
            
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-turquoise/20 to-turquoise/10 rounded-2xl blur-3xl transform rotate-6 scale-110 -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;