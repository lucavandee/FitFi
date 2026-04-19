import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import Button from './Button';
import LoadingFallback from './LoadingFallback';
import { sanitizeRichHtml } from '@/utils/sanitizeHtml';

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
    // SECURITY: Escape HTML first to prevent XSS
    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    // Simple markdown to HTML conversion (with XSS protection)
    return markdown
      .replace(/^# (.*$)/gim, (match, p1) => `<h1 class="text-3xl font-bold text-[#1A1A1A] mb-6">${escapeHtml(p1)}</h1>`)
      .replace(/^## (.*$)/gim, (match, p1) => `<h2 class="text-2xl font-semibold text-[#1A1A1A] mb-4 mt-8">${escapeHtml(p1)}</h2>`)
      .replace(/^### (.*$)/gim, (match, p1) => `<h3 class="text-xl font-medium text-[#1A1A1A] mb-3 mt-6">${escapeHtml(p1)}</h3>`)
      .replace(/^\*\*(.*)\*\*/gim, (match, p1) => `<strong class="font-semibold">${escapeHtml(p1)}</strong>`)
      .replace(/^\*(.*)\*/gim, (match, p1) => `<em class="italic">${escapeHtml(p1)}</em>`)
      .replace(/^- (.*$)/gim, (match, p1) => `<li class="mb-1 ml-4">• ${escapeHtml(p1)}</li>`)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        // SECURITY: Validate URL to prevent javascript: protocol XSS
        const safeUrl = url.trim().toLowerCase().startsWith('javascript:') ? '#' : url;
        return `<a href="${escapeHtml(safeUrl)}" class="text-[#C2654A] hover:text-[#C2654A]/80 underline">${escapeHtml(text)}</a>`;
      })
      .replace(/\n\n/g, '</p><p class="text-[#1A1A1A] leading-relaxed mb-4">')
      .replace(/^(?!<[h|l|s|e])/gm, '<p class="text-[#1A1A1A] leading-relaxed mb-4">')
      .replace(/$(?![>])/gm, '</p>');
  };

  if (isLoading) {
    return <LoadingFallback fullScreen message="Content laden..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">Content niet gevonden</h1>
          <p className="text-[#8A8A8A] mb-6">{error}</p>
          <Button as={Link} to={backLink} variant="primary">
            {backLabel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-4xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        {/* Header */}
        {(title || description || backLink) && (
          <div className="mb-8">
            {backLink && (
              <Link
                to={backLink}
                className="inline-flex items-center text-[#C2654A] hover:text-[#C2654A]/80 transition-colors mb-6"
              >
                <ArrowLeft size={20} className="mr-2" />
                {backLabel}
              </Link>
            )}

            {(title || description) && (
              <div className="flex items-center justify-between">
                <div>
                  {title && <h1 className="text-3xl font-light text-[#1A1A1A] mb-2">{title}</h1>}
                  {description && <p className="text-[#8A8A8A]">{description}</p>}
                </div>

                {downloadUrl && (
                  <Button
                    as="a"
                    href={downloadUrl}
                    variant="outline"
                    icon={<Download size={16} />}
                    iconPosition="left"
                    className="border-[#C2654A] text-[#C2654A] hover:bg-[#C2654A] hover:text-white"
                  >
                    Download PDF
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(renderMarkdown(content)) }}
          />
        </div>
      </div>
    </div>
  );
};

export default MarkdownPage;