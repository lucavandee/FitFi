import React from 'react';

interface MarkdownPageProps {
  title: string;
  content: string;
  lastUpdated?: string;
  className?: string;
}

export default function MarkdownPage({ title, content, lastUpdated, className = '' }: MarkdownPageProps) {
  return (
    <div className={`max-w-4xl mx-auto px-4 py-12 ${className}`}>
      <article className="prose prose-lg max-w-none">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-text)] mb-4">{title}</h1>
          {lastUpdated && (
            <p className="text-sm text-[var(--color-muted)]">
              Laatst bijgewerkt: {new Date(lastUpdated).toLocaleDateString('nl-NL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}
        </header>
        <div
          className="text-[var(--color-text)] leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>
    </div>
  );
}
