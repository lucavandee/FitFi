import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Naam is verplicht';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mailadres is verplicht';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ongeldig e-mailadres';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Onderwerp is verplicht';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Bericht is verplicht';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Bericht moet minimaal 10 karakters zijn';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      try {
        // Try Supabase first
        const { error } = await supabase.rpc('submit_contact', {
          contact_name: formData.name,
          contact_email: formData.email,
          contact_subject: formData.subject,
          contact_message: formData.message,
          contact_type: formData.type
        });

        if (error) {
          throw error;
        }
      } catch (supabaseError) {
        console.warn('Supabase failed, using mailto fallback:', supabaseError);
        
        // Fallback to mailto
        const mailtoUrl = `mailto:info@fitfi.nl?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
          `Naam: ${formData.name}\nE-mail: ${formData.email}\nType: ${formData.type}\n\nBericht:\n${formData.message}`
        )}`;
        
        window.location.href = mailtoUrl;
      }

      toast.success('Bedankt voor je bericht! We reageren binnen 24 uur.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general'
      });
      
      // Redirect to thank you page
      setTimeout(() => navigate('/bedankt'), 1500);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Er ging iets mis bij het verzenden. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-[#0D1B2A] mb-6">
            Neem contact op
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Heb je een vraag of wil je partner worden? Wij reageren binnen één werkdag.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <h2 className="text-2xl font-medium text-[#0D1B2A] mb-6">
              Stuur ons een bericht
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Naam *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-2xl shadow-sm focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors ${
                      errors.name ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Je volledige naam"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-mailadres *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-2xl shadow-sm focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors ${
                      errors.email ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="je@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type vraag
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors"
                >
                  <option value="general">Algemene vraag</option>
                  <option value="support">Technische ondersteuning</option>
                  <option value="business">Zakelijke samenwerking</option>
                  <option value="press">Pers & Media</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Onderwerp *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-2xl shadow-sm focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors ${
                    errors.subject ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Waar gaat je bericht over?"
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.subject}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Bericht *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-2xl shadow-sm focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors resize-none ${
                    errors.message ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Vertel ons meer over je vraag..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.message}
                  </p>
                )}
              </div>
              
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isSubmitting}
                icon={isSubmitting ? undefined : <Send size={20} />}
                iconPosition="right"
                className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-[#0D1B2A] border-t-transparent rounded-full animate-spin mr-2"></div>
                    Verzenden...
                  </div>
                ) : (
                  'Bericht verzenden'
                )}
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-white rounded-3xl shadow-sm p-8">
              <h3 className="text-xl font-medium text-[#0D1B2A] mb-6">
                Contactgegevens
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-[#89CFF0]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="text-[#89CFF0]" size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#0D1B2A] mb-1">E-mail</h4>
                    <p className="text-gray-600">info@fitfi.nl</p>
                    <p className="text-sm text-gray-500">Voor algemene vragen</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-[#89CFF0]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="text-[#89CFF0]" size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#0D1B2A] mb-1">Support</h4>
                    <p className="text-gray-600">support@fitfi.nl</p>
                    <p className="text-sm text-gray-500">Voor technische ondersteuning</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-[#89CFF0]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="text-[#89CFF0]" size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#0D1B2A] mb-1">Telefoon</h4>
                    <p className="text-gray-600">+31 20 123 4567</p>
                    <p className="text-sm text-gray-500">Ma-Vr 9:00-17:00</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-[#89CFF0]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-[#89CFF0]" size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#0D1B2A] mb-1">Adres</h4>
                    <p className="text-gray-600">
                      Marktstraat 15D<br />
                      7551 DR Hengelo<br />
                      Nederland
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Times */}
            <div className="bg-white rounded-3xl shadow-sm p-8">
              <h3 className="text-xl font-medium text-[#0D1B2A] mb-6">
                Reactietijden
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="font-medium text-green-800">Algemene vragen</span>
                  </div>
                  <span className="text-green-600 font-medium">{"< 24 uur"}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Clock className="text-blue-600" size={20} />
                    <span className="font-medium text-blue-800">Technische support</span>
                  </div>
                  <span className="text-blue-600 font-medium">{"< 4 uur"}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="text-purple-600" size={20} />
                    <span className="font-medium text-purple-800">Zakelijke vragen</span>
                  </div>
                  <span className="text-purple-600 font-medium">{"< 2 uur"}</span>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="bg-gradient-to-r from-[#89CFF0] to-blue-500 rounded-3xl shadow-sm p-8 text-center">
              <h3 className="text-xl font-medium text-white mb-4">
                Veelgestelde vragen
              </h3>
              <p className="text-white/90 mb-6">
                Misschien staat je vraag al beantwoord in onze FAQ sectie.
              </p>
              <Button
                as="a"
                href="/faq"
                variant="secondary"
                className="bg-white text-[#89CFF0] hover:bg-gray-100"
              >
                Bekijk FAQ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;