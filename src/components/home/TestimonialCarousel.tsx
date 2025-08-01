import React, { useEffect, useState } from 'react';
import { Star, CheckCircle, Play, Pause } from 'lucide-react';
import { TESTIMONIALS, Testimonial, fetchLiveTestimonials } from '../../data/testimonials';
import ImageWithFallback from '../ui/ImageWithFallback';

interface TestimonialCarouselProps {
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({ 
  className = '',
  autoPlay = true,
  autoPlayInterval = 4000
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(TESTIMONIALS);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isPaused, setIsPaused] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load live testimonials
  useEffect(() => {
    const loadLiveTestimonials = async () => {
      try {
        const liveData = await fetchLiveTestimonials();
        if (liveData.length > 0) {
          setTestimonials(liveData);
        }
      } catch (error) {
        console.warn('Using static testimonials');
      }
    };

    loadLiveTestimonials();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || isPaused || !isVisible) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, isPaused, isVisible, testimonials.length, autoPlayInterval]);

  // Pause on hover (desktop only)
  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsPaused(false);
    }
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Intersection observer for fade-in animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('community');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={`${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Sentiment-based styling
  const getSentimentStyling = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'border-l-4 border-green-400 bg-gradient-to-r from-green-50/50 to-transparent';
      case 'neutral':
        return 'border-l-4 border-blue-400 bg-gradient-to-r from-blue-50/50 to-transparent';
      case 'negative':
        return 'border-l-4 border-orange-400 bg-gradient-to-r from-orange-50/50 to-transparent';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  // Category badge
  const getCategoryBadge = (category?: string) => {
    const badges = {
      style: { label: 'Stijl', color: 'bg-purple-100 text-purple-700' },
      service: { label: 'Service', color: 'bg-blue-100 text-blue-700' },
      results: { label: 'Resultaten', color: 'bg-green-100 text-green-700' },
      experience: { label: 'Ervaring', color: 'bg-orange-100 text-orange-700' }
    };
    return badges[category as keyof typeof badges];
  };

  const renderTestimonialCard = (testimonial: Testimonial, index: number) => (
    <div
      key={testimonial.id}
      className={`bg-white dark:bg-[#1E1B2E] rounded-3xl shadow-lg p-6 flex flex-col gap-4 h-full transition-all duration-300 ${getSentimentStyling(testimonial.sentiment)}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <ImageWithFallback
            src={testimonial.avatar}
            alt={`${testimonial.name} - Tevreden gebruiker`}
            className="h-12 w-12 rounded-full object-cover"
            loading="lazy"
            componentName="TestimonialCarousel"
          />
          {testimonial.verified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle size={12} className="text-white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-[#6E2EB7] dark:text-[#B043FF]">
            {testimonial.name}
            {testimonial.category && (
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getCategoryBadge(testimonial.category)?.color}`}>
                {getCategoryBadge(testimonial.category)?.label}
              </span>
            )}
          </h4>
          <div className="flex items-center gap-2">
            <div className="flex">
              {renderStars(testimonial.rating)}
            </div>
            {testimonial.location && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {testimonial.location}
              </span>
            )}
          </div>
        </div>
      </div>
      <blockquote className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
        "{testimonial.text}"
      </blockquote>
      <div className="text-xs text-gray-400 text-right">
        {new Date().toLocaleDateString('nl-NL')}
      </div>
    </div>
  );

  // Mobile Swiper Implementation
  if (isMobile) {
    return (
      <div
        id="testimonial-carousel"
        className={`relative ${className} ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
        role="region"
        aria-label="Klantbeoordelingen"
      >
        {/* Auto-play Controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">
            {testimonials.length} beoordelingen
          </div>
          <button
            onClick={toggleAutoPlay}
            className="flex items-center space-x-2 text-sm text-[#6E2EB7] hover:text-[#5A2596] transition-colors"
            aria-label={isPlaying ? 'Pauzeer auto-play' : 'Start auto-play'}
          >
            {isPlaying ? (
              <><Pause size={14} /> <span>Pauzeer</span></>
            ) : (
              <><Play size={14} /> <span>Afspelen</span></>
            )}
          </button>
        </div>

        {/* Screen reader instructions */}
        <div className="sr-only">
          Veeg om meer reviews te zien
        </div>

        {/* Swiper Container */}
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-out"
            style={{ 
              transform: `translateX(-${currentSlide * 85}%)`,
              width: `${testimonials.length * 85}%`
            }}
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="flex-none w-[80%] px-2"
                style={{ width: `${80 / testimonials.length}%` }}
                aria-hidden={index !== currentSlide}
              >
                {renderTestimonialCard(testimonial, index)}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center space-x-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentSlide ? 'bg-[#6E2EB7]' : 'bg-gray-300'
              }`}
              aria-label={`Ga naar testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Touch/Swipe Handlers */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute left-0 top-0 bottom-0 w-16 pointer-events-auto cursor-pointer"
            onClick={prevSlide}
            aria-label="Vorige testimonial"
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-16 pointer-events-auto cursor-pointer"
            onClick={nextSlide}
            aria-label="Volgende testimonial"
          />
        </div>
      </div>
    );
  }

  // Desktop Grid (unchanged)
  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className} ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
      role="region"
      aria-label="Klantbeoordelingen"
    >
      {testimonials.slice(0, 6).map((testimonial, index) => (
        <div
          key={testimonial.id}
          className={`${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {renderTestimonialCard(testimonial, index)}
        </div>
      ))}
    </div>
  );
};

export default TestimonialCarousel;