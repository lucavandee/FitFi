import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, CheckCircle, Star, Users, Zap, Shield } from 'lucide-react';
import Button from '../components/ui/Button';
import Walkthrough from '../components/walkthrough/Walkthrough';
import StyleArchetypeSlider from '../components/home/StyleArchetypeSlider';

const HomePage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track form submission
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'lead_capture', {
        event_category: 'engagement',
        event_label: 'homepage_form',
        name: formData.name,
        email: formData.email
      });
    }
    
    // Navigate to onboarding with pre-filled data
    window.location.href = `/onboarding?name=${encodeURIComponent(formData.name)}&email=${encodeURIComponent(formData.email)}`;
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="flex-1 text-center lg:text-left mb-12 lg:mb-0 lg:pr-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-secondary leading-tight mb-6">
                Discover Your Perfect Style with AI
              </h1>
              
              <p className="text-xl md:text-2xl text-body leading-relaxed mb-8">
                Get personalized clothing recommendations that match your unique style, body type, and preferences.
              </p>
              
              {/* Lead Capture Form */}
              <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg max-w-md mx-auto lg:mx-0 mb-8">
                <h3 className="text-xl font-semibold mb-4">Start Your Style Journey</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-secondary"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your email"
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-secondary"
                    required
                  />
                  <Button 
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    icon={<ArrowRight size={20} />}
                    iconPosition="right"
                  >
                    Start Style Quiz
                  </Button>
                </form>
              </div>
            </div>
            
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative">
                <img 
                  src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2" 
                  alt="Stylish person using FitFi app" 
                  className="rounded-2xl shadow-2xl max-w-sm w-full"
                />
                <div className="absolute -bottom-6 -left-6 bg-accent text-text-dark p-4 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">AI analyzing your style...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why FitFi Section */}
      <section className="py-20 bg-primary-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8">
              Why Choose FitFi?
            </h2>
            
            <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="text-secondary" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
                  <p className="text-gray-600">Advanced algorithms analyze your preferences and body type</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-secondary" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Personalized</h3>
                  <p className="text-gray-600">Recommendations tailored specifically to your unique style</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="text-secondary" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
                  <p className="text-gray-600">Your data is encrypted and never shared without permission</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <Walkthrough />

      {/* Style Archetypes */}
      <StyleArchetypeSlider />

      {/* Demo Video Section */}
      <section className="py-20 bg-primary-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8">
              See FitFi in Action
            </h2>
            
            <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900">
                <img 
                  src="https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=1200&h=675&dpr=2" 
                  alt="FitFi Demo Video Thumbnail" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-20 h-20 bg-secondary/90 rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
                    <Play className="text-primary ml-1" size={32} />
                  </button>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                Watch how FitFi analyzes your style preferences and creates personalized outfit recommendations in under 2 minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8">
              Transform Your Wardrobe
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold mb-4">Before FitFi</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-red-500 mr-3">✗</span>
                  <span>Hours spent browsing without finding the right fit</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3">✗</span>
                  <span>Buying clothes that don't match your style</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3">✗</span>
                  <span>Uncertainty about what looks good on you</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3">✗</span>
                  <span>Wasted money on items you rarely wear</span>
                </li>
              </ul>
            </div>

            <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold mb-4">After FitFi</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span>Personalized recommendations in minutes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span>Clothes that perfectly match your body type</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span>Confidence in every outfit choice</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span>Smart investments in your wardrobe</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-primary-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8">
              What Our Users Say
            </h2>
            
            <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={24} />
                ))}
              </div>
              
              <blockquote className="text-xl italic mb-6">
                "FitFi completely transformed how I shop for clothes. The AI recommendations are incredibly accurate, and I finally feel confident in my style choices!"
              </blockquote>
              
              <div className="flex items-center justify-center">
                <img 
                  src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2" 
                  alt="Sarah M."
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div className="text-left">
                  <p className="font-semibold">Sarah M.</p>
                  <p className="text-gray-600">Marketing Professional</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
            Ready to Discover Your Perfect Style?
          </h2>
          <p className="text-xl text-body mb-8 max-w-2xl mx-auto">
            Join thousands of users who have transformed their wardrobe with AI-powered style recommendations.
          </p>
          <Button 
            as={Link}
            to="/onboarding" 
            variant="primary"
            size="lg"
            icon={<ArrowRight size={20} />}
            iconPosition="right"
            className="hover-lift transition-transform shadow-lg hover:shadow-xl"
          >
            Start Your Style Journey
          </Button>
          <p className="text-sm text-body mt-4">
            Free to start • No credit card required
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;