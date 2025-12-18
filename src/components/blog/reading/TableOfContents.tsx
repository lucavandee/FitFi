import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  items: TOCItem[];
  isSticky?: boolean;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  items,
  isSticky = false
}) => {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsOpen(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <nav
      className={`
        bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-6
        ${isSticky ? 'md:sticky md:top-24' : ''}
      `}
    >
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden w-full flex items-center justify-between text-[var(--color-text)] font-bold mb-4"
      >
        <span>Inhoud</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {/* Desktop title */}
      <h2 className="hidden md:block text-[var(--color-text)] font-bold mb-4">
        In dit artikel
      </h2>

      {/* TOC items */}
      <ul className={`space-y-2 ${isOpen ? 'block' : 'hidden md:block'}`}>
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => scrollToSection(item.id)}
              className={`
                w-full text-left px-3 py-2 rounded-lg transition-colors text-sm leading-snug
                ${activeId === item.id
                  ? 'bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] font-medium'
                  : 'text-[var(--color-muted)] hover:bg-[var(--ff-color-primary-50)] hover:text-[var(--color-text)]'
                }
                ${item.level === 3 ? 'pl-6' : ''}
              `}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
