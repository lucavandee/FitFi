import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  User,
  Check
} from 'lucide-react';
import Button from '../components/ui/Button';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-20 overflow-hidden transition-colors">
        <div className="absolute inset-0 z-0 opacity-30 dark:opacity-20">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="flex-1 text-center lg:text-left mb-10 lg:mb-0 lg:pr-10 animate-slide-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Discover Your Perfect Style With <span className="text-orange-500">AI</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0">
                FitFi uses AI to analyze your preferences and photo to create personalized clothing and lifestyle recommendations just for you.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  as={Link}
                  to="/onboarding" 
                  size="lg" 
                  variant="primary"
                  icon={<ArrowRight size={20} />}
                  iconPosition="right"
                  className="hover-lift transition-transform animate-fade-in"
                >
                  Get Started Now
                </Button>
                <Button 
                  as={Link}
                  to="#how-it-works" 
                  size="lg" 
                  variant="outline"
                  className="hover-lift transition-transform animate-fade-in"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="flex-1 flex justify-center lg:justify-end animate-fade-in">
              <div className="relative h-[420px] w-[320px] rounded-xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Stylish person with personalized outfit" 
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                        <Sparkles className="text-orange-500" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Style Match: 94%</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">Perfect for your preferences</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="flex flex-wrap justify-center gap-8 text-center animate-fade-in">
            <div className="flex flex-col items-center">
              <div className="text-gray-600 dark:text-gray-400 mb-1">Trusted by</div>
              <div className="font-bold text-2xl text-gray-900 dark:text-white">10,000+</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Active Users</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-gray-600 dark:text-gray-400 mb-1">Outfits Created</div>
              <div className="font-bold text-2xl text-gray-900 dark:text-white">1M+</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">& Counting</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-gray-600 dark:text-gray-400 mb-1">Satisfaction</div>
              <div className="font-bold text-2xl text-gray-900 dark:text-white">4.8/5</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              How FitFi Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our AI-powered platform creates personalized style recommendations in just a few simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Step 1 */}
            <div className="bg-orange-50 dark:bg-gray-800 rounded-xl p-6 transition-all hover-lift hover:shadow-md animate-fade-in">
              <div className="bg-orange-100 dark:bg-orange-900/30 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                <User className="text-orange-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Complete the Questionnaire</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tell us about your preferences, lifestyle, and fashion goals through our intuitive questionnaire.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-orange-50 dark:bg-gray-800 rounded-xl p-6 transition-all hover-lift hover:shadow-md animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="bg-orange-100 dark:bg-orange-900/30 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-orange-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Upload a Photo</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Securely upload your photo so our AI can understand your body type and current style.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-orange-50 dark:bg-gray-800 rounded-xl p-6 transition-all hover-lift hover:shadow-md animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="bg-orange-100 dark:bg-orange-900/30 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="text-orange-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Get Personalized Recommendations</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Receive AI-powered style advice tailored specifically to your body type, preferences, and lifestyle.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button 
              as={Link}
              to="/onboarding" 
              variant="primary"
              size="lg"
              className="hover-lift transition-transform animate-fade-in"
            >
              Start Your Style Journey
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Why Choose FitFi
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our platform offers unique benefits that set us apart from traditional styling services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm transition-all hover-lift animate-fade-in">
              <div className="text-orange-500 mb-4">
                <Sparkles size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                AI-Powered Recommendations
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our advanced AI analyzes thousands of fashion combinations to find what works best for you.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm transition-all hover-lift animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-orange-500 mb-4">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Privacy-First Approach
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your data and photos are encrypted and never shared with third parties without your consent.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm transition-all hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-orange-500 mb-4">
                <Clock size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Save Time & Money
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Stop wasting money on clothes that don't work for you. Get personalized advice in minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Choose Your Plan
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get started for free or upgrade for premium features and recommendations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all hover-lift animate-fade-in">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Free</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">$0</span>
                  <span className="ml-1 text-gray-500 dark:text-gray-400">/month</span>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Perfect for trying out the platform
                </p>

                <ul className="mt-6 space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-400">
                      Basic style questionnaire
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-400">
                      1 photo upload per month
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-400">
                      3 outfit recommendations
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-400">
                      Basic style tips
                    </p>
                  </li>
                </ul>
              </div>

              <div className="px-6 pb-6">
                <Button 
                  as={Link}
                  to="/onboarding" 
                  variant="outline" 
                  fullWidth
                  className="mt-8"
                >
                  Get Started
                </Button>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="bg-orange-50 dark:bg-gray-800 border-2 border-orange-500 rounded-xl overflow-hidden relative transition-all hover-lift animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1 text-xs font-bold uppercase rounded-bl-lg">
                Popular
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Premium</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">$12.99</span>
                  <span className="ml-1 text-gray-500 dark:text-gray-400">/month</span>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  All the tools you need for complete style transformation
                </p>

                <ul className="mt-6 space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-400">
                      Advanced style questionnaire
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-400">
                      Unlimited photo uploads
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-400">
                      Unlimited outfit recommendations
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-400">
                      Detailed styling consultation
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-400">
                      Seasonal wardrobe updates
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-400">
                      Priority support
                    </p>
                  </li>
                </ul>
              </div>

              <div className="px-6 pb-6">
                <Button 
                  as={Link}
                  to="/onboarding?plan=premium" 
                  variant="primary" 
                  fullWidth
                  className="mt-8"
                >
                  Start Premium Trial
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-700 dark:to-orange-800 py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Discover Your Perfect Style?
          </h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
            Join thousands of satisfied users who've transformed their style with FitFi.
          </p>
          <Button 
            as={Link}
            to="/onboarding" 
            variant="secondary"
            size="lg"
            className="animate-fade-in"
          >
            Get Started for Free
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;