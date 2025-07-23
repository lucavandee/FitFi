import React, { useState } from 'react';
import { 
  MessageSquare, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Send, 
  User, 
  AtSign, 
  FileText, 
  Check 
} from 'lucide-react';
import Button from '../components/ui/Button';
import ErrorBoundary from '../components/ErrorBoundary';

const FeedbackPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedbackType: '',
    rating: 0,
    message: '',
    acceptTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message || !formData.acceptTerms) {
      setSubmitError('Vul alle verplichte velden in en accepteer de voorwaarden.');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        feedbackType: '',
        rating: 0,
        message: '',
        acceptTerms: false
      });
    } catch (error) {
      setSubmitError('Er is iets misgegaan. Probeer het later opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F6]">
      <div className="max-w-4xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        {/* Hero Section */}
        <ErrorBoundary>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-6">
            Jouw mening telt
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We waarderen je feedback enorm. Deel je ervaringen, suggesties of problemen om ons te helpen FitFi nog beter te maken.
          </p>
        </div>
        </ErrorBoundary>

        {/* Feedback Form */}
        <ErrorBoundary>
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-16">
          <div className="p-8">
            <h2 className="text-2xl font-medium text-gray-900 mb-6">
              Geef feedback
            </h2>
            
            {submitSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="text-green-500" size={32} />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Bedankt voor je feedback!
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  We waarderen je input enorm en gebruiken deze om FitFi te verbeteren. Als je een vraag hebt gesteld of een probleem hebt gemeld, nemen we zo snel mogelijk contact met je op.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSubmitSuccess(false)}
                  className="rounded-2xl shadow-sm px-6 py-3 transition-transform hover:scale-105"
                >
                  Nieuwe feedback geven
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Naam <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 bg-white rounded-2xl shadow-sm focus:ring-2 focus:ring-[#bfae9f] focus:border-[#bfae9f] text-gray-900 placeholder-gray-500 transition-all"
                        placeholder="Je naam"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      E-mailadres <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <AtSign size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 bg-white rounded-2xl shadow-sm focus:ring-2 focus:ring-[#bfae9f] focus:border-[#bfae9f] text-gray-900 placeholder-gray-500 transition-all"
                        placeholder="je@email.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="feedbackType" className="block text-sm font-medium text-gray-700 mb-1">
                      Type feedback
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText size={18} className="text-gray-400" />
                      </div>
                      <select
                        id="feedbackType"
                        name="feedbackType"
                        value={formData.feedbackType}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 bg-white rounded-2xl shadow-sm focus:ring-2 focus:ring-[#bfae9f] focus:border-[#bfae9f] text-gray-900 transition-all"
                      >
                        <option value="">Selecteer type feedback</option>
                        <option value="suggestion">Suggestie voor verbetering</option>
                        <option value="bug">Probleem of bug melden</option>
                        <option value="compliment">Compliment</option>
                        <option value="feature">Nieuwe functie verzoek</option>
                        <option value="other">Overig</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Hoe zou je je ervaring met FitFi beoordelen?
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => handleRatingChange(rating)}
                          className={`p-2 rounded-full transition-colors ${
                            formData.rating >= rating 
                              ? 'bg-[#bfae9f]/20 text-[#bfae9f]' 
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <Star className={formData.rating >= rating ? 'fill-current' : ''} size={24} />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Je feedback <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="block w-full px-4 py-3 border border-gray-200 bg-white rounded-2xl shadow-sm focus:ring-2 focus:ring-[#bfae9f] focus:border-[#bfae9f] text-gray-900 placeholder-gray-500 transition-all"
                      placeholder="Deel je gedachten, suggesties of ervaringen met ons..."
                    ></textarea>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="acceptTerms"
                        name="acceptTerms"
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={handleCheckboxChange}
                        required
                        className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="acceptTerms" className="text-gray-600">
                        Ik ga akkoord met de <a href="/privacy-policy" className="text-[#bfae9f] hover:text-[#a89a8c] transition-colors">privacyvoorwaarden</a> en geef toestemming om contact met mij op te nemen indien nodig. <span className="text-red-500">*</span>
                      </label>
                    </div>
                  </div>
                  
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-2xl text-sm">
                      {submitError}
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={isSubmitting}
                    icon={isSubmitting ? undefined : <Send size={16} />}
                    iconPosition="right"
                    className="rounded-2xl shadow-sm px-6 py-3 transition-transform hover:scale-105 mt-2"
                  >
                    {isSubmitting ? 'Verzenden...' : 'Feedback verzenden'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
        </ErrorBoundary>

        {/* What Happens With Feedback */}
        <ErrorBoundary>
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-16">
          <div className="p-8">
            <h2 className="text-2xl font-medium text-gray-900 mb-6">
              Wat doen we met je feedback?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-2xl">
                <div className="bg-[#bfae9f]/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <MessageSquare className="text-[#bfae9f]" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  We luisteren
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Elk stukje feedback wordt zorgvuldig gelezen door ons team. We nemen je mening serieus.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-2xl">
                <div className="bg-[#bfae9f]/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <ThumbsUp className="text-[#bfae9f]" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  We verbeteren
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Je feedback helpt ons om FitFi te verbeteren. We gebruiken het om nieuwe functies te ontwikkelen en bestaande te verfijnen.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-2xl">
                <div className="bg-[#bfae9f]/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <ThumbsDown className="text-[#bfae9f]" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  We lossen op
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Als je een probleem meldt, werken we er hard aan om het zo snel mogelijk op te lossen en houden we je op de hoogte.
                </p>
              </div>
            </div>
          </div>
        </div>
        </ErrorBoundary>

        {/* Testimonials */}
        <ErrorBoundary>
        <div className="mb-16">
          <h2 className="text-2xl font-medium text-gray-900 text-center mb-8">
            Feedback die impact heeft gemaakt
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={16} />
                ))}
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                "Ik suggereerde een functie om outfits te kunnen opslaan voor later. Binnen een maand was deze functie geïmplementeerd! Het is geweldig om te zien dat FitFi echt luistert naar gebruikers."
              </p>
              <div className="flex items-center">
                <div className="mr-3">
                  <div className="w-10 h-10 rounded-full bg-[#bfae9f]/20 flex items-center justify-center text-[#bfae9f] font-medium">
                    M
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Marieke J.</h4>
                  <p className="text-gray-500 text-sm">Premium gebruiker</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={16} />
                ))}
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                "Ik meldde een bug in de app en kreeg binnen een uur reactie van het supportteam. Het probleem was de volgende dag opgelost. Indrukwekkende service!"
              </p>
              <div className="flex items-center">
                <div className="mr-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-medium">
                    T
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Tim B.</h4>
                  <p className="text-gray-500 text-sm">Basis gebruiker</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </ErrorBoundary>

        {/* Feature Request */}
        <ErrorBoundary>
        <div className="bg-gradient-to-r from-[#bfae9f] to-purple-600 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-medium text-white mb-4">
              Heb je een idee voor een nieuwe functie?
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto leading-relaxed">
              We zijn altijd op zoek naar manieren om FitFi te verbeteren. Deel je ideeën en help ons de app nog beter te maken.
            </p>
            <Button 
              as="a"
              href="mailto:feedback@fitfi.nl?subject=Feature%20Request"
              variant="secondary"
              size="lg"
              className="bg-white text-[#bfae9f] hover:bg-gray-100 rounded-2xl shadow-sm px-6 py-3 transition-transform hover:scale-105"
            >
              Deel je idee
            </Button>
          </div>
        </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default FeedbackPage;