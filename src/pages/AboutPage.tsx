import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Users, Zap, Heart, Award, ShieldCheck, Sparkles, Clock, Target } from 'lucide-react';
import Button from '../components/ui/Button';

const AboutPage: React.FC = () => {
  // Team members data
  const teamMembers = [
    {
      name: "Luc van Dokkum",
      role: "Founder & CEO",
      bio: "Verbindt zijn passie voor mode en technologie om jou slim en stijlvol te stylen.",
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2",
      social: {
        linkedin: "https://linkedin.com/in/lucvandokkum",
        twitter: "https://twitter.com/lucvandokkum"
      }
    },
    {
      name: "Emma Jansen",
      role: "Head of AI & Style",
      bio: "Mode-expert met 10+ jaar ervaring in de fashion industrie en AI-implementatie.",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2",
      social: {
        linkedin: "https://linkedin.com/in/emmajansen"
      }
    },
    {
      name: "Thomas Bakker",
      role: "CTO",
      bio: "AI-specialist met een achtergrond in computer vision en machine learning.",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2",
      social: {
        linkedin: "https://linkedin.com/in/thomasbakker",
        github: "https://github.com/thomasbakker"
      }
    },
    {
      name: "Sophie de Vries",
      role: "Lead Designer",
      bio: "UX/UI expert met een passie voor het creëren van intuïtieve en elegante gebruikerservaringen.",
      avatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2",
      social: {
        linkedin: "https://linkedin.com/in/sophiedevries",
        dribbble: "https://dribbble.com/sophiedevries"
      }
    }
  ];

  // Company milestones
  const milestones = [
    {
      year: "2023",
      title: "FitFi opgericht",
      description: "Luc van Dokkum start FitFi met een missie om AI-gestuurde stijladvies toegankelijk te maken voor iedereen."
    },
    {
      year: "2023",
      title: "Eerste prototype",
      description: "Lancering van het eerste AI-model dat stijlvoorkeuren kan analyseren en matchen met kledingitems."
    },
    {
      year: "2024",
      title: "Seed funding",
      description: "€1.2M seed funding van Nederlandse tech-investeerders om het platform te schalen."
    },
    {
      year: "2024",
      title: "Lancering FitFi 1.0",
      description: "Officiële lancering van het FitFi platform met geavanceerde AI-stijlanalyse en personalisatie."
    },
    {
      year: "2025",
      title: "10.000+ gebruikers",
      description: "Mijlpaal van 10.000 actieve gebruikers bereikt, met een gemiddelde tevredenheidsscore van 4.8/5."
    }
  ];

  // Partners and recognition
  const partners = [
    { name: "Zalando", logo: "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=100&h=50&dpr=2" },
    { name: "H&M", logo: "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=100&h=50&dpr=2" },
    { name: "Wehkamp", logo: "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=100&h=50&dpr=2" },
    { name: "ASOS", logo: "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=100&h=50&dpr=2" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Over FitFi
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Stel je voor: binnen enkele klikken zie je outfits die naadloos passen bij jouw stijl én lichaam. 
            Geen eindeloos zoeken of twijfelen meer – FitFi brengt je direct naar je perfecte look.
          </p>
        </div>

        {/* Tech Meets Style Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              💡 Tech meets stijl — voor mensen die weten wat ze willen
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
              Bij FitFi draait alles om stijl, identiteit en eenvoud. We combineren de kracht van AI met een scherp gevoel voor design — zodat jij in één klik ziet welke outfits echt bij je passen.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Geen gedoe, geen one-size-fits-all. Maar een persoonlijke stijlervaring die moeiteloos werkt.
            </p>
          </div>
        </div>

        {/* Why FitFi Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="p-8">
            <div className="flex items-center mb-6">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
                <Target className="text-orange-500" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                🚀 Waarom FitFi is ontstaan
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
              Stijladvies online is óf oppervlakkig, óf overweldigend. Je krijgt duizenden opties of saaie basics die niet bij je passen.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Wij wilden het anders:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-6">
              <li>Slimmer dan standaard stylingapps</li>
              <li>Eenvoudiger dan personal shoppers</li>
              <li>Visueel en intuïtief zoals je dat van topmerken verwacht</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              FitFi is geboren uit die frustratie — en gebouwd met visie. Voor mensen die weten wat ze willen, maar wel even die AI-powered second opinion kunnen gebruiken.
            </p>
          </div>
        </div>

        {/* What Makes FitFi Different Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              🧠 Wat maakt FitFi anders?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-500">
                    <Zap size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    🔍 AI die jou begrijpt
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Onze AI analyseert je voorkeuren, stijltype en wensen — en laat outfits zien die écht bij jou passen. Met uitleg waarom het werkt.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-500">
                    <Sparkles size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    🧥 Outfits die kloppen
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Geen losse kledingstukken, maar complete looks met context. Van 'Smart Casual Italiaans' tot 'Edgy Streetwear' — elke combinatie past bij jouw profiel.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-500">
                    <Clock size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    🤝 Shop & swipe coming soon
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Binnenkort koppel je je profiel aan je favoriete merken en bestel je outfits direct. Zo bespaar je tijd én miskopen.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500">
                    <ShieldCheck size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    🔒 Privacy by design
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We verzamelen alleen wat nodig is. Jouw foto's en data zijn veilig, worden niet gedeeld, en kunnen op elk moment worden verwijderd. Volledige transparantie.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Values Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="p-8">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mr-4">
                <Heart className="text-purple-500" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                🌍 Wat we belangrijk vinden
              </h2>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We bouwen FitFi met stijl, respect en visie. Dat betekent:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3 mt-0.5">
                  <Users size={16} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">💬 Inclusieve stijladviezen voor iedereen</span> — wat je maat, gender of voorkeur ook is
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3 mt-0.5">
                  <Award size={16} className="text-green-500" />
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">🧵 Bewuste keuzes</span> — we werken toe naar aanbevelingen op basis van kwaliteit, duurzaamheid en tijdloze stijl
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full mr-3 mt-0.5">
                  <Heart size={16} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">🖤 Geen algoritme zonder gevoel</span> — we combineren data met menselijke stijlprincipes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              🛠 Wat er nog aankomt
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We bouwen FitFi in fases — met jou als gebruiker centraal:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3">
                  <span className="text-green-500 text-sm font-bold">✓</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Gepersonaliseerde stijlprofielen</span> (live)
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3">
                  <span className="text-green-500 text-sm font-bold">✓</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">AI-outfits op basis van jouw voorkeuren</span> (live)
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3">
                  <span className="text-blue-500 text-sm font-bold">🔄</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Feedbacksysteem om stijladviezen te verfijnen</span> (in testfase)
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3">
                  <span className="text-blue-500 text-sm font-bold">🔄</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Direct shoppen via partnerwebshops</span> (in voorbereiding)
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full mr-3">
                  <span className="text-gray-500 dark:text-gray-400 text-sm font-bold">📱</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Mobile-first interface met swipe-functionaliteit</span> (Q3 gepland)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section - Enhanced */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="p-8">
            <div className="flex items-center mb-8">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mr-4">
                <Users className="text-blue-500" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                🤝 Wie we zijn
              </h2>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              FitFi is opgezet door een klein team met een grote visie. Wij combineren tech, branding en stijl in een ervaring die werkt.
            </p>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              We zijn geen fashion goeroes. We zijn bouwers, denkers en perfectionisten — met één doel: Stijl toegankelijk maken voor iedereen, zonder oppervlakkigheid.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex flex-col items-center text-center group">
                  <div className="relative mb-4 overflow-hidden rounded-xl">
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-40 h-40 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                      <div className="flex space-x-3">
                        {member.social.linkedin && (
                          <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                          </a>
                        )}
                        {member.social.twitter && (
                          <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                            </svg>
                          </a>
                        )}
                        {member.social.github && (
                          <a href={member.social.github} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                          </a>
                        )}
                        {member.social.dribbble && (
                          <a href={member.social.dribbble} target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-400 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-orange-500 font-medium text-sm mb-2">
                    {member.role}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Company Journey - NEW */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="p-8">
            <div className="flex items-center mb-8">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mr-4">
                <Clock className="text-purple-500" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Onze reis
              </h2>
            </div>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 transform md:translate-x-0 translate-x-4"></div>
              
              {/* Timeline items */}
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={index} className={`relative flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="md:w-1/2 mb-8 md:mb-0 flex md:justify-end">
                      <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 md:mr-8 md:ml-0 ml-8 ${index % 2 === 0 ? 'md:ml-8 md:mr-0' : ''}`}>
                        <div className="text-sm text-orange-500 font-semibold mb-1">{milestone.year}</div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{milestone.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{milestone.description}</p>
                      </div>
                    </div>
                    
                    {/* Timeline dot */}
                    <div className="absolute left-4 md:left-1/2 w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center transform -translate-x-4 md:-translate-x-4">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    </div>
                    
                    <div className="md:w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Partners & Recognition - NEW */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="p-8">
            <div className="flex items-center mb-8">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full mr-4">
                <Award className="text-yellow-500" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Partners & Erkenning
              </h2>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Onze retail partners
              </h3>
              <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                {partners.map((partner, index) => (
                  <div key={index} className="grayscale hover:grayscale-0 transition-all duration-300">
                    <img 
                      src={partner.logo} 
                      alt={partner.name} 
                      className="h-10 object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Erkenning & Awards
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                  <div className="text-2xl text-yellow-500 mb-2">🏆</div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Dutch AI Startup Award</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">2024 Finalist</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                  <div className="text-2xl text-yellow-500 mb-2">🚀</div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Tech Innovator of the Year</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">2024 Nominee</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                  <div className="text-2xl text-yellow-500 mb-2">💯</div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Customer Satisfaction</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">4.8/5 Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Future Vision - NEW */}
        <div className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="p-8">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mr-4">
                <Sparkles className="text-blue-500" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Onze toekomstvisie
              </h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
              Bij FitFi geloven we dat de toekomst van mode persoonlijker, duurzamer en toegankelijker wordt. Onze roadmap voor de komende jaren:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 dark:bg-gray-800/80 p-5 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  2025
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Uitbreiding naar meer Europese markten en integratie met duurzame modepartners.
                </p>
              </div>
              
              <div className="bg-white/80 dark:bg-gray-800/80 p-5 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  2026
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Lancering van AR try-on technologie en geavanceerde garderobe-management tools.
                </p>
              </div>
              
              <div className="bg-white/80 dark:bg-gray-800/80 p-5 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  2027
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Wereldwijde expansie en lancering van ons eigen duurzame modelabel.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-700 dark:to-orange-800 rounded-xl shadow-md overflow-hidden transition-colors">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              ✨ Nieuwsgierig naar jouw stijltype?
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Doe de test en ontdek jouw AI-style match.
            </p>
            <Button
              as="a"
              href="/onboarding"
              variant="secondary"
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100"
              icon={<ArrowRight size={20} />}
              iconPosition="right"
            >
              Begin je stijlreis
            </Button>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Neem contact op
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Heb je vragen of feedback? We horen graag van je!
          </p>
          <Button
            as="a"
            href="mailto:info@fitfi.nl"
            variant="outline"
            icon={<Mail size={20} />}
            iconPosition="left"
          >
            Email ons
          </Button>
          
          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            <p>FitFi B.V. • Amsterdam, Nederland</p>
            <p>KVK: 12345678 • BTW: NL123456789B01</p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link to="/" className="text-orange-500 hover:text-orange-600 transition-colors">
            Terug naar home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;