import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import Button from './Button';
import LoadingFallback from './LoadingFallback';

interface MarkdownPageProps {
  title?: string;
  description?: string;
  markdownPath?: string;
  content?: string;
  downloadUrl?: string;
  backLink?: string;
  backLabel?: string;
}

const MarkdownPage: React.FC<MarkdownPageProps> = ({
  title,
  description,
  markdownPath,
  content: inlineContent,
  downloadUrl,
  backLink = '/',
  backLabel = 'Terug naar home'
}) => {
  const [content, setContent] = useState<string>(inlineContent || '');
  const [isLoading, setIsLoading] = useState(!inlineContent);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (inlineContent) {
      setIsLoading(false);
      return;
    }

    if (!markdownPath) {
      setError('Geen content beschikbaar');
      setIsLoading(false);
      return;
    }

    const loadContent = async () => {
      try {
        const response = await fetch(markdownPath);
        if (!response.ok) {
          throw new Error('Content niet gevonden');
        }

        const text = await response.text();
        setContent(text);
      } catch (error) {
        console.error('Error loading markdown:', error);
        setError('Er is een fout opgetreden bij het laden van de content. Neem contact op voor meer informatie.');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [markdownPath, inlineContent]);

  const renderMarkdown = (markdown: string) => {
    // Simple markdown to HTML conversion
    return markdown
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mb-6">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-gray-900 mb-4 mt-8">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium text-gray-900 mb-3 mt-6">$1</h3>')
      .replace(/^\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/^\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/^- (.*$)/gim, '<li class="mb-1 ml-4">• $1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#89CFF0] hover:text-[#89CFF0]/80 underline">$1</a>')
      .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-4">')
      .replace(/^(?!<[h|l|s|e])/gm, '<p class="text-gray-700 leading-relaxed mb-4">')
      .replace(/$(?![>])/gm, '</p>');
  };

  if (isLoading) {
    return <LoadingFallback fullScreen message="Content laden..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Content niet gevonden</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button as={Link} to={backLink} variant="primary">
            {backLabel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <div className="max-w-4xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        {/* Header */}
        {(title || description || backLink) && (
          <div className="mb-8">
            {backLink && (
              <Link
                to={backLink}
                className="inline-flex items-center text-[#89CFF0] hover:text-[#89CFF0]/80 transition-colors mb-6"
              >
                <ArrowLeft size={20} className="mr-2" />
                {backLabel}
              </Link>
            )}

            {(title || description) && (
              <div className="flex items-center justify-between">
                <div>
                  {title && <h1 className="text-3xl font-light text-gray-900 mb-2">{title}</h1>}
                  {description && <p className="text-gray-600">{description}</p>}
                </div>

                {downloadUrl && (
                  <Button
                    as="a"
                    href={downloadUrl}
                    variant="outline"
                    icon={<Download size={16} />}
                    iconPosition="left"
                    className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
                  >
                    Download PDF
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        </div>
      </div>
    </div>
  );
};

export default MarkdownPage;