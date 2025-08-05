import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Star, TrendingUp, Heart, Share2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';
import LoadingFallback from '../components/ui/LoadingFallback';

const DynamicResultsPage: React.FC = () => {
  const { user, isLoading: userLoading } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [analysisComplete, setAnalysisComplete] = useState(false);
  
  // Get dynamic onboarding data from location state
  const dynamicData = location.state?.dynamicData;

  useEffect(() => {
    // Simulate AI analysis completion
    const timer = setTimeout(() => {
      setAnalysisComplete(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  if (userLoading) {
    return <LoadingFallback fullScreen message="Dynamic resultaten laden..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
          <h2 className="text-2xl font-light text-gray-900 mb-4">Inloggen vereist</h2>
          <p className="text-gray-600 mb-6">Je moet ingelogd zijn om je resultaten te bekijken.</p>
          <Button as={Link} to="/inloggen" variant="primary" fullWidth>
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  if (!analysisComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F6] via-white to-[#F5F3F0] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-[#89CFF0] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-light text-gray-900 mb-4">
            Dynamic AI analyseert jouw stijl...
          </h2>
          <p className="text-gray-600 mb-6">
            We creëren jouw dynamic stijlprofiel met real-time data.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#89CFF0] h-2 rounded-full animate-pulse" style={{ width: '90%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F6] via-white to-[#F5F3F0]">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/dashboard"
            className="inline-flex items-center text-[#89CFF0] hover:text-[#89CFF0]/80 transition-colors mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Terug naar dashboard
          </Link>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-[#89CFF0] rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Jouw Dynamic AI-Stijlanalyse
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Gebaseerd op jouw dynamic onboarding hebben we een real-time stijlprofiel voor je samengesteld
            </p>
          </div>
        </div>

        {/* Dynamic Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Analysis Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-medium text-gray-900">Dynamic Stijlprofiel</h2>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-lg font-medium text-gray-900">94% Dynamic Match</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-[#89CFF0]/10 to-purple-50 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Dynamic {getDynamicStyleTitle(dynamicData)}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {getDynamicStyleDescription(dynamicData)}
              </p>
              <div className="flex flex-wrap gap-2">
                {getDynamicStyleTags(dynamicData).map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Dynamic voorkeuren:</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Real-time Match</span>
                    <span>94%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#89CFF0] h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Dynamic Adaptability</span>
                    <span>91%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{ width: '91%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Personalization Score</span>
                    <span>96%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-400 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dynamic Stats */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h3 className="font-medium text-gray-900 mb-4">Dynamic Statistieken</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Dynamic Score</span>
                  <span className="font-medium text-[#89CFF0]">94%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Adaptability</span>
                  <span className="font-medium text-green-600">91%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Personalization</span>
                  <span className="font-medium text-purple-600">96%</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h3 className="font-medium text-gray-900 mb-4">Acties</h3>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  icon={<Heart size={16} />}
                  iconPosition="left"
                  className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-white"
                >
                  Bewaar Dynamic Profiel
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  icon={<Share2 size={16} />}
                  iconPosition="left"
                  className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
                >
                  Deel Dynamic Resultaat
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-4">
            Dynamic Aanbevelingen
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Met je dynamic stijlprofiel kunnen we real-time gepersonaliseerde outfit aanbevelingen voor je maken.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              as={Link}
              to="/outfits" 
              variant="primary"
              size="lg"
              icon={<TrendingUp size={20} />}
              iconPosition="left"
              className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-white"
            >
              Bekijk Dynamic Outfits
            </Button>
            <Button 
              as={Link}
              to="/dynamic-onboarding"
              variant="outline"
              size="lg"
              className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
            >
              Onboarding Opnieuw
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function getDynamicStyleTitle(data: any): string {
  if (data?.archetypes && data.archetypes.length > 0) {
    const primary = data.archetypes[0];
    return `${primary.charAt(0).toUpperCase() + primary.slice(1).replace('_', ' ')} Specialist`;
  }
  return 'Dynamic Stijl';
}

function getDynamicStyleDescription(data: any): string {
  let desc = 'Jouw dynamic stijlprofiel is real-time aangepast ';
  
  if (data?.season) {
    desc += `voor het ${data.season}seizoen `;
  }
  
  if (data?.occasions && data.occasions.length > 0) {
    desc += `met focus op ${data.occasions.join(', ').toLowerCase()} `;
  }
  
  desc += 'voor een volledig gepersonaliseerde en adaptieve stijlervaring.';
  
  return desc;
}

function getDynamicStyleTags(data: any): string[] {
  const tags = ['Dynamic', 'Real-time', 'Adaptief'];
  
  if (data?.archetypes) {
    tags.push(...data.archetypes.map((arch: string) => 
      arch.charAt(0).toUpperCase() + arch.slice(1).replace('_', ' ')
    ));
  }
  
  if (data?.season) {
    tags.push(data.season.charAt(0).toUpperCase() + data.season.slice(1));
  }
  
  tags.push('AI-Powered', 'Personalized');
  
  return Array.from(new Set(tags)).slice(0, 6);
}

export default DynamicResultsPage;