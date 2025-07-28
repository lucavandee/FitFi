import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Download } from 'lucide-react';
import Button from '../components/ui/Button';

const PrivacyPolicyPage: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch('/content/legal/privacy-policy.md');
        const text = await response.text();
        setContent(text);
      } catch (error) {
        console.error('Error loading privacy policy:', error);
        setContent('# Privacybeleid\n\nEr is een fout opgetreden bij het laden van het privacybeleid. Neem contact op voor meer informatie.');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  const renderMarkdown = (markdown: string) => {
    // Simple markdown to HTML conversion
    return markdown
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mb-6">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-gray-900 mb-4 mt-8">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium text-gray-900 mb-3 mt-6">$1</h3>')
      .replace(/^\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/^\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/^- (.*$)/gim, '<li class="mb-1">$1</li>')
      .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-4">')
      .replace(/^(?!<[h|l|s|e])/gm, '<p class="text-gray-700 leading-relaxed mb-4">')
      .replace(/$(?![>])/gm, '</p>');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#bfae9f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Privacybeleid laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F6]">
      <div className="max-w-4xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-[#bfae9f] hover:text-[#a89a8c] transition-colors mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Terug naar home
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#bfae9f]/20 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#bfae9f]" />
              </div>
              <div>
                <h1 className="text-3xl font-light text-gray-900">Privacybeleid</h1>
                <p className="text-gray-600">Hoe we omgaan met jouw gegevens</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              icon={<Download size={16} />}
              iconPosition="left"
              className="border-[#bfae9f] text-[#bfae9f] hover:bg-[#bfae9f] hover:text-white"
            >
              Download PDF
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#bfae9f] to-purple-600 rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-medium text-white mb-4">
            Vragen over je privacy?
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Neem contact op met onze Data Protection Officer voor alle privacy-gerelateerde vragen.
          </p>
          <Button
            as="a"
            href="mailto:privacy@fitfi.nl"
            variant="secondary"
            className="bg-white text-[#bfae9f] hover:bg-gray-100"
          >
            Contact DPO
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;