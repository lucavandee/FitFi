import React, { useEffect, useState } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { TESTIMONIALS, Testimonial } from '../../data/testimonials';
import ImageWithFallback from '../ui/ImageWithFallback';

interface TestimonialCarouselProps {
  className?: string;
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({ className = '' }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    setCurrentSlide((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
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

  const renderTestimonialCard = (testimonial: Testimonial, index: number) => (
    <div
      key={testimonial.id}
      className="bg-white dark:bg-[#1E1B2E] rounded-3xl shadow-lg p-6 flex flex-col gap-4 h-full transition-colors duration-300"
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
    </div>
  );

  // Mobile Swiper Implementation
  if (isMobile) {
    return (
      <motion.div
        className={`relative ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        role="region"
        aria-label="Klantbeoordelingen"
      >
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
              width: `${TESTIMONIALS.length * 85}%`
            }}
          >
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="flex-none w-[80%] px-2"
                style={{ width: `${80 / TESTIMONIALS.length}%` }}
                aria-hidden={index !== currentSlide}
              >
                {renderTestimonialCard(testimonial, index)}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center space-x-2 mt-6">
          {TESTIMONIALS.map((_, index) => (
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
      </motion.div>
    );
  }

  // Desktop Grid (unchanged)
  return (
    <motion.div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      role="region"
      aria-label="Klantbeoordelingen"
    >
      {TESTIMONIALS.slice(0, 6).map((testimonial, index) => (
        <motion.div
          key={testimonial.id}
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          {renderTestimonialCard(testimonial, index)}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default TestimonialCarousel;