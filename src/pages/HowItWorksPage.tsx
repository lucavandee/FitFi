import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Camera, 
  Zap, 
  ShoppingBag, 
  ArrowRight,
  CheckCircle,
  Clock,
  Smartphone,
  Sparkles,
  ShieldCheck,
  Award,
  Heart,
  Star,
  Users,
  Layers
} from 'lucide-react';
import Button from '../components/ui/Button';
import ErrorBoundary from '../components/ErrorBoundary';

const HowItWorksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'process' | 'technology' | 'privacy'>('process');

  return (
    <div className="min-h-screen bg-[#FAF8F6]">
      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        {/* Hero Section */}
        <ErrorBoundary>
          <section className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 leading-tight mb-6">
            Hoe FitFi werkt
          </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            In vier eenvoudige stappen helpen we je jouw perfecte stijl te ontdekken en te shoppen. Geen gedoe, geen twijfel - alleen kleding die echt bij je past.
          </p>
          </section>
        </ErrorBoundary>

        {/* Tabs Navigation - NEW */}
        <ErrorBoundary>
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-full p-1 inline-flex shadow-sm">
            <button 
              onClick={() => setActiveTab('process')}
              className={`px-6 py-2 rounded-full transition-colors ${
                activeTab === 'process' 
                  ? 'bg-[#bfae9f] text-white font-medium' 
                  : 'text-gray-700 font-medium hover:bg-gray-100'
              }`}
            >
              Het proces
            </button>
            <button 
              onClick={() => setActiveTab('technology')}
              className={`px-6 py-2 rounded-full transition-colors ${
                activeTab === 'technology' 
                  ? 'bg-[#bfae9f] text-white font-medium' 
                  : 'text-gray-700 font-medium hover:bg-gray-100'
              }`}
            >
              De technologie
            </button>
            <button 
              onClick={() => setActiveTab('privacy')}
              className={`px-6 py-2 rounded-full transition-colors ${
                activeTab === 'privacy' 
                  ? 'bg-[#bfae9f] text-white font-medium' 
                  : 'text-gray-700 font-medium hover:bg-gray-100'
              }`}
            >
              Privacy & veiligheid
            </button>
          </div>
          </div>
        </ErrorBoundary>

        {/* Process Tab Content */}
        {activeTab === 'process' && (
          <>
            {/* Step 1 */}
            <ErrorBoundary>
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-12">
              <div className="md:flex">
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center mb-6">
                      <div className="bg-[#bfae9f]/20 p-3 rounded-full mr-4">
                        <User className="text-[#bfae9f]" size={24} />
                    </div>
                    <div>
                        <span className="text-[#bfae9f] font-medium">Stap 1</span>
                        <h2 className="text-2xl font-medium text-gray-900">
                        Vul je stijlprofiel in
                      </h2>
                    </div>
                  </div>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    Beantwoord enkele vragen over je stijlvoorkeuren, lichaamsbouw en levensstijl. Onze intuïtieve vragenlijst maakt het eenvoudig om je persoonlijkheid te laten zien.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-900">Persoonlijke voorkeuren</span> - Geef aan welke stijlen, kleuren en patronen je aanspreken
                      </p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-900">Gelegenheden</span> - Vertel ons voor welke situaties je kleding zoekt
                      </p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-900">Comfort prioriteiten</span> - Geef aan wat voor jou belangrijk is in dagelijkse kleding
                      </p>
                    </div>
                  </div>
                </div>
                  <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-8">
                  <img 
                    src="https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2" 
                    alt="Stijlprofiel invullen" 
                      className="rounded-xl shadow-md max-h-80 object-cover"
                  />
                </div>
              </div>
              </div>
            </ErrorBoundary>

            {/* Step 2 */}
            <ErrorBoundary>
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-12">
              <div className="md:flex flex-row-reverse">
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center mb-6">
                      <div className="bg-blue-50 p-3 rounded-full mr-4">
                      <Camera className="text-blue-500" size={24} />
                    </div>
                    <div>
                        <span className="text-blue-500 font-medium">Stap 2</span>
                        <h2 className="text-2xl font-medium text-gray-900">
                        Upload een foto (optioneel)
                      </h2>
                    </div>
                  </div>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    Voor nog nauwkeurigere aanbevelingen kun je een foto uploaden. Onze AI analyseert je lichaamsbouw en huidige stijl om perfecte matches te vinden.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-900">Veilige verwerking</span> - Je foto wordt end-to-end versleuteld en nooit gedeeld
                      </p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-900">Lichaamsbouw analyse</span> - Onze AI herkent welke stijlen jou flatteren
                      </p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-900">Volledig optioneel</span> - Je krijgt ook zonder foto goede aanbevelingen
                      </p>
                    </div>
                  </div>
                </div>
                  <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-8">
                  <img 
                    src="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2" 
                    alt="Foto uploaden" 
                      className="rounded-xl shadow-md max-h-80 object-cover"
                  />
                </div>
              </div>
              </div>
            </ErrorBoundary>

            {/* Step 3 */}
            <ErrorBoundary>
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-12">
              <div className="md:flex">
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center mb-6">
                      <div className="bg-purple-50 p-3 rounded-full mr-4">
                      <Zap className="text-purple-500" size={24} />
                    </div>
                    <div>
                        <span className="text-purple-500 font-medium">Stap 3</span>
                        <h2 className="text-2xl font-medium text-gray-900">
                        Ontvang gepersonaliseerde aanbevelingen
                      </h2>
                    </div>
                  </div>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    Onze AI verwerkt je voorkeuren en genereert direct outfits die perfect bij jou passen. Bekijk complete looks of individuele items.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-900">Complete outfits</span> - Perfecte combinaties voor elke gelegenheid
                      </p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-900">Match percentages</span> - Zie hoe goed elke aanbeveling bij je past
                      </p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-900">Stijltips</span> - Krijg advies over hoe je items het beste draagt
                      </p>
                    </div>
                  </div>
                </div>
                  <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-8">
                  <img 
                    src="https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2" 
                    alt="Gepersonaliseerde aanbevelingen" 
                      className="rounded-xl shadow-md max-h-80 object-cover"
                  />
                </div>
              </div>
              </div>
            </ErrorBoundary>

            {/* Step 4 */}
            <ErrorBoundary>
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-16">
              <div className="md:flex flex-row-reverse">
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center mb-6">
                      <div className="bg-green-50 p-3 rounded-full mr-4">
                      <ShoppingBag className="text-green-500" size={24} />
                    </div>
                    <div>
                        <span className="text-green-500 font-medium">Stap 4</span>
                        <h2 className="text-2xl font-medium text-gray-900">
                        Shop via onze partners
                      </h2>
                    </div>
                  </div>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    Vind je iets dat je leuk vindt? Met één klik word je doorgestuurd naar onze betrouwbare retailpartners om je aankoop te voltooien.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-900">Directe links</span> - Shop bij bekende Nederlandse retailers
                      </p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-900">Veilig winkelen</span> - Alle partners zijn zorgvuldig geselecteerd
                      </p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-900">Prijsvergelijking</span> - Vind de beste deals voor jouw favoriete items
                      </p>
                    </div>
                  </div>
                </div>
                  <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-8">
                  <img 
                    src="https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2" 
                    alt="Online winkelen" 
                      className="rounded-xl shadow-md max-h-80 object-cover"
                  />
                </div>
              </div>
              </div>
            </ErrorBoundary>
          </>
        )}

        {/* Technology Tab Content - NEW */}
        {activeTab === 'technology' && (
          <>
            {/* AI Technology Section */}
            <ErrorBoundary>
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-12">
              <div className="p-8">
                <div className="flex items-center mb-8">
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                    <Zap className="text-blue-500" size={24} />
                  </div>
                    <h2 className="text-2xl font-medium text-gray-900">
                    Onze AI-technologie
                  </h2>
                </div>
                
                  <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  FitFi gebruikt geavanceerde AI-algoritmes om je stijlvoorkeuren te analyseren en te matchen met kledingitems die perfect bij jou passen. Hier is hoe het werkt:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center mb-4">
                        <div className="bg-blue-50 p-2 rounded-full mr-3">
                        <Layers className="text-blue-500" size={20} />
                      </div>
                        <h3 className="text-lg font-medium text-gray-900">
                        Deep Learning Netwerken
                      </h3>
                    </div>
                      <p className="text-gray-600">
                      Onze AI is getraind op miljoenen mode-items en stijlcombinaties om patronen te herkennen en te begrijpen welke items goed samengaan.
                    </p>
                  </div>
                  
                    <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center mb-4">
                        <div className="bg-purple-50 p-2 rounded-full mr-3">
                        <Camera className="text-purple-500" size={20} />
                      </div>
                        <h3 className="text-lg font-medium text-gray-900">
                        Computer Vision
                      </h3>
                    </div>
                      <p className="text-gray-600">
                      Onze computer vision-technologie analyseert je foto om je lichaamsbouw, proporties en huidige stijl te begrijpen voor nauwkeurigere aanbevelingen.
                    </p>
                  </div>
                  
                    <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center mb-4">
                        <div className="bg-green-50 p-2 rounded-full mr-3">
                        <Users className="text-green-500" size={20} />
                      </div>
                        <h3 className="text-lg font-medium text-gray-900">
                        Collaborative Filtering
                      </h3>
                    </div>
                      <p className="text-gray-600">
                      We gebruiken collaborative filtering om te leren van de voorkeuren van gebruikers met vergelijkbare stijlen, waardoor onze aanbevelingen steeds beter worden.
                    </p>
                  </div>
                  
                    <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center mb-4">
                        <div className="bg-[#bfae9f]/20 p-2 rounded-full mr-3">
                          <Heart className="text-[#bfae9f]" size={20} />
                      </div>
                        <h3 className="text-lg font-medium text-gray-900">
                        Preference Learning
                      </h3>
                    </div>
                      <p className="text-gray-600">
                      Onze AI leert continu van je feedback en interacties om je aanbevelingen te verfijnen en aan te passen aan je veranderende voorkeuren.
                    </p>
                  </div>
                </div>
              </div>
              </div>
            </ErrorBoundary>

            {/* Style Archetypes Section */}
            <ErrorBoundary>
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-12">
              <div className="p-8">
                <div className="flex items-center mb-8">
                    <div className="bg-purple-50 p-3 rounded-full mr-4">
                    <Award className="text-purple-500" size={24} />
                  </div>
                    <h2 className="text-2xl font-medium text-gray-900">
                    Stijlarchetypen
                  </h2>
                </div>
                
                  <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  FitFi gebruikt een uniek systeem van stijlarchetypen om je persoonlijke stijl te categoriseren en te begrijpen. Dit helpt ons om de perfecte aanbevelingen voor jou te genereren.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="text-center mb-4">
                      <span className="text-3xl">👔</span>
                        <h3 className="text-lg font-medium text-gray-900 mt-2">
                        Klassiek
                      </h3>
                    </div>
                      <p className="text-gray-600 text-sm">
                      Tijdloze elegantie en verfijnde stukken die nooit uit de mode gaan. Perfect voor wie houdt van een gepolijste, professionele uitstraling.
                    </p>
                  </div>
                  
                    <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="text-center mb-4">
                      <span className="text-3xl">👗</span>
                        <h3 className="text-lg font-medium text-gray-900 mt-2">
                        Casual Chic
                      </h3>
                    </div>
                      <p className="text-gray-600 text-sm">
                      Moeiteloos elegant met een relaxte twist. De perfecte balans tussen comfort en stijl voor de moderne lifestyle.
                    </p>
                  </div>
                  
                    <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="text-center mb-4">
                      <span className="text-3xl">🏙️</span>
                        <h3 className="text-lg font-medium text-gray-900 mt-2">
                        Urban
                      </h3>
                    </div>
                      <p className="text-gray-600 text-sm">
                      Stoere stadslook met functionele details. Gemaakt voor het moderne stadsleven met een praktische maar stijlvolle benadering.
                    </p>
                  </div>
                  
                    <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="text-center mb-4">
                      <span className="text-3xl">🎨</span>
                        <h3 className="text-lg font-medium text-gray-900 mt-2">
                        Streetstyle
                      </h3>
                    </div>
                      <p className="text-gray-600 text-sm">
                      Authentieke streetwear met attitude. Voor de echte trendsetter die durft op te vallen en zijn eigen pad kiest.
                    </p>
                  </div>
                  
                    <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="text-center mb-4">
                      <span className="text-3xl">📻</span>
                        <h3 className="text-lg font-medium text-gray-900 mt-2">
                        Retro
                      </h3>
                    </div>
                      <p className="text-gray-600 text-sm">
                      Vintage vibes met moderne twist. Nostalgie die nooit verveelt, met een frisse benadering van klassieke stijlen.
                    </p>
                  </div>
                  
                    <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="text-center mb-4">
                      <span className="text-3xl">💎</span>
                        <h3 className="text-lg font-medium text-gray-900 mt-2">
                        Luxury
                      </h3>
                    </div>
                      <p className="text-gray-600 text-sm">
                      Exclusieve stukken van topkwaliteit. Voor de fijnproever die investeert in tijdloze luxe en verfijnde elegantie.
                    </p>
                  </div>
                </div>
              </div>
              </div>
            </ErrorBoundary>

            {/* Continuous Improvement Section */}
            <ErrorBoundary>
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-12">
              <div className="p-8">
                <div className="flex items-center mb-6">
                    <div className="bg-green-50 p-3 rounded-full mr-4">
                      <Star className="text-green-500" size={24} />
                  </div>
                    <h2 className="text-2xl font-medium text-gray-900">
                    Continue verbetering
                  </h2>
                </div>
                
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Onze AI wordt voortdurend slimmer. Elke interactie, feedback en aankoop helpt ons systeem om betere aanbevelingen te doen voor jou en alle andere gebruikers.
                </p>
                
                  <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center mb-4">
                    <Star className="text-yellow-500 mr-3" size={24} />
                      <h3 className="text-lg font-medium text-gray-900">
                      Hoe jij kunt helpen
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-900">Geef feedback</span> - Beoordeel aanbevelingen om ons te helpen je voorkeuren beter te begrijpen
                      </p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-900">Sla outfits op</span> - Dit helpt ons te begrijpen welke stijlen je het meest aanspreken
                      </p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-900">Update je voorkeuren</span> - Stijl evolueert, en jouw voorkeuren ook. Houd je profiel up-to-date
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </ErrorBoundary>
          </>
        )}

        {/* Privacy Tab Content - NEW */}
        {activeTab === 'privacy' && (
          <>
            {/* Data Security Section */}
            <ErrorBoundary>
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-12">
              <div className="p-8">
                <div className="flex items-center mb-8">
                    <div className="bg-green-50 p-3 rounded-full mr-4">
                    <ShieldCheck className="text-green-500" size={24} />
                  </div>
                    <h2 className="text-2xl font-medium text-gray-900">
                    Hoe we je gegevens beschermen
                  </h2>
                </div>
                
                  <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  Bij FitFi nemen we de privacy en veiligheid van je gegevens zeer serieus. We gebruiken geavanceerde beveiligingstechnologieën om je persoonlijke informatie te beschermen.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center mb-4">
                        <div className="bg-green-50 p-2 rounded-full mr-3">
                        <ShieldCheck className="text-green-500" size={20} />
                      </div>
                        <h3 className="text-lg font-medium text-gray-900">
                        End-to-end encryptie
                      </h3>
                    </div>
                      <p className="text-gray-600">
                      Al je gegevens, inclusief foto's, worden versleuteld tijdens verzending en opslag. Alleen jij en onze beveiligde AI-systemen hebben toegang.
                    </p>
                  </div>
                  
                    <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center mb-4">
                        <div className="bg-blue-50 p-2 rounded-full mr-3">
                        <Users className="text-blue-500" size={20} />
                      </div>
                        <h3 className="text-lg font-medium text-gray-900">
                        Geen data-sharing
                      </h3>
                    </div>
                      <p className="text-gray-600">
                      We delen je persoonlijke gegevens nooit met derden zonder jouw expliciete toestemming. Je gegevens zijn van jou.
                    </p>
                  </div>
                  
                    <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center mb-4">
                        <div className="bg-orange-50 p-2 rounded-full mr-3">
                          <Clock className="text-orange-500" size={20} />
                      </div>
                        <h3 className="text-lg font-medium text-gray-900">
                        Tijdelijke opslag
                      </h3>
                    </div>
                      <p className="text-gray-600">
                      Je foto's worden alleen tijdelijk opgeslagen voor analyse en worden daarna automatisch verwijderd van onze servers.
                    </p>
                  </div>
                  
                    <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center mb-4">
                        <div className="bg-purple-50 p-2 rounded-full mr-3">
                        <Award className="text-purple-500" size={20} />
                      </div>
                        <h3 className="text-lg font-medium text-gray-900">
                        AVG/GDPR Compliant
                      </h3>
                    </div>
                      <p className="text-gray-600">
                      We voldoen volledig aan de Europese privacywetgeving (AVG/GDPR) en geven je volledige controle over je gegevens.
                    </p>
                  </div>
                </div>
              </div>
              </div>
            </ErrorBoundary>

            {/* Your Data Rights Section */}
            <ErrorBoundary>
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-12">
              <div className="p-8">
                <div className="flex items-center mb-6">
                    <div className="bg-[#bfae9f]/20 p-3 rounded-full mr-4">
                      <User className="text-[#bfae9f]" size={24} />
                  </div>
                    <h2 className="text-2xl font-medium text-gray-900">
                    Jouw rechten
                  </h2>
                </div>
                
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Je hebt volledige controle over je gegevens bij FitFi. Hier zijn je rechten:
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                    <div>
                        <h3 className="font-medium text-gray-900">Recht op inzage</h3>
                        <p className="text-gray-600 text-sm">
                        Je kunt op elk moment inzien welke gegevens we over je hebben opgeslagen.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                    <div>
                        <h3 className="font-medium text-gray-900">Recht op correctie</h3>
                        <p className="text-gray-600 text-sm">
                        Je kunt onjuiste gegevens laten corrigeren via je accountinstellingen.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                    <div>
                        <h3 className="font-medium text-gray-900">Recht op verwijdering</h3>
                        <p className="text-gray-600 text-sm">
                        Je kunt verzoeken om al je gegevens te verwijderen via je privacy-instellingen.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                    <div>
                        <h3 className="font-medium text-gray-900">Recht op dataportabiliteit</h3>
                        <p className="text-gray-600 text-sm">
                        Je kunt je gegevens downloaden in een gestructureerd formaat.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-blue-700 text-sm">
                    Voor meer informatie over hoe we met je gegevens omgaan, bekijk ons <a href="/juridisch" className="underline font-medium">privacybeleid</a> of neem <a href="/contact" className="underline font-medium">contact</a> met ons op.
                  </p>
                </div>
              </div>
              </div>
            </ErrorBoundary>
          </>
        )}

        {/* Additional Benefits */}
        <ErrorBoundary>
          <section className="mb-16">
            <h2 className="text-3xl font-light text-gray-900 text-center mb-10">
            Extra voordelen
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
              <div className="bg-white rounded-3xl p-6 shadow-sm transition-all hover:shadow-md hover:transform hover:scale-105">
                <div className="text-[#bfae9f] mb-4">
                <Clock size={28} />
              </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                Tijdbesparend
              </h3>
                <p className="text-gray-600">
                Bespaar gemiddeld 5 uur per maand aan zoeken en winkelen. FitFi doet het werk voor je.
              </p>
            </div>

            {/* Benefit 2 */}
              <div className="bg-white rounded-3xl p-6 shadow-sm transition-all hover:shadow-md hover:transform hover:scale-105">
                <div className="text-[#bfae9f] mb-4">
                <Smartphone size={28} />
              </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                Altijd beschikbaar
              </h3>
                <p className="text-gray-600">
                Toegang tot je persoonlijke stijladvies wanneer en waar je maar wilt, direct op je telefoon.
              </p>
            </div>

            {/* Benefit 3 */}
              <div className="bg-white rounded-3xl p-6 shadow-sm transition-all hover:shadow-md hover:transform hover:scale-105">
                <div className="text-[#bfae9f] mb-4">
                <Sparkles size={28} />
              </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                Continu lerende AI
              </h3>
                <p className="text-gray-600">
                Hoe meer je FitFi gebruikt, hoe beter de aanbevelingen worden. Onze AI leert van jouw feedback.
              </p>
            </div>
          </div>
          </section>
        </ErrorBoundary>

        {/* CTA Section */}
        <ErrorBoundary>
          <section className="bg-gradient-to-r from-[#bfae9f] to-purple-600 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-8 text-center">
              <h2 className="text-2xl font-medium text-white mb-4">
              Klaar om je stijlreis te beginnen?
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Ontdek in slechts enkele minuten outfits die perfect bij jou passen. Geen verplichtingen, geen kosten.
            </p>
            <Button 
              as={Link}
              to="/onboarding" 
              variant="secondary"
              size="lg"
                className="bg-white text-[#bfae9f] hover:bg-gray-100 rounded-2xl shadow-sm px-6 py-3 transition-transform hover:scale-105"
              icon={<ArrowRight size={20} />}
              iconPosition="right"
            >
              Start je stijlreis
            </Button>
          </div>
          </section>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default HowItWorksPage;