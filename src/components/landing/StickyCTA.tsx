import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export function StickyCTA() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 50% of viewport height
      const scrolled = window.scrollY > window.innerHeight * 0.5;

      // Hide when near bottom (within 200px of footer)
      const nearBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200;

      setIsVisible(scrolled && !isDismissed && !nearBottom);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  const handleClick = () => {
    if (user) {
      navigate('/onboarding');
    } else {
      navigate('/register');
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 px-4 sm:px-0 max-w-[calc(100vw-2rem)] sm:max-w-none ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="bg-[var(--ff-color-primary-700)] text-white rounded-2xl shadow-2xl px-4 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-6 hover:bg-[var(--ff-color-primary-600)] transition-colors group border-2 border-[var(--ff-color-primary-600)]">

        {/* CTA Button */}
        <button
          onClick={handleClick}
          className="flex items-center gap-2 sm:gap-3 font-bold text-base sm:text-lg"
        >
          <span className="hidden xs:inline">Start gratis</span>
          <span className="xs:hidden">Start nu</span>
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:translate-x-1" />
        </button>

        {/* Divider - hidden on mobile */}
        <div className="hidden sm:block w-px h-8 bg-white/30"></div>

        {/* Trust badge */}
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <span className="font-medium">Gratis</span>
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="ml-auto sm:ml-2 w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="Sluit"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}
