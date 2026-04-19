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
        bg-[#FFFFFF] border-2 border-[#E5E5E5] rounded-2xl p-6
        ${isSticky ? 'md:sticky md:top-24' : ''}
      `}
    >
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="toc-list"
        className="md:hidden w-full flex items-center justify-between text-[#1A1A1A] font-bold mb-4"
      >
        <span>Inhoud</span>
        {isOpen ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
      </button>

      {/* Desktop title */}
      <p className="hidden md:block text-[#1A1A1A] font-bold mb-4">
        In dit artikel
      </p>

      {/* TOC items */}
      <ul id="toc-list" className={`space-y-2 ${isOpen ? 'block' : 'hidden md:block'}`}>
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => scrollToSection(item.id)}
              className={`
                w-full text-left px-3 py-2 rounded-lg transition-colors text-sm leading-snug
                ${activeId === item.id
                  ? 'bg-[#FAF5F2] text-[#A8513A] font-medium'
                  : 'text-[#8A8A8A] hover:bg-[#FAF5F2] hover:text-[#1A1A1A]'
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
