import React from "react";
import { Heart, Eye, MessageCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SmartImage from "@/components/media/SmartImage";
import { track } from "@/utils/analytics";

const GALLERY_ITEMS = [
  { 
    src: "/images/ugc/1.jpg", 
    title: "Casual chic", 
    description: "Beige trench + witte sneakers = tijdloos en comfortabel",
    likes: 24,
    views: 156,
    comments: 8,
    category: "casual"
  },
  { 
    src: "/images/ugc/2.jpg", 
    title: "Business casual", 
    description: "Navy blazer + beige chino = professioneel maar toegankelijk",
    likes: 31,
    views: 203,
    comments: 12,
    category: "business"
  },
  { 
    src: "/images/ugc/3.jpg", 
    title: "Weekend look", 
    description: "Denim jacket + witte tee = relaxed maar verzorgd",
    likes: 18,
    views: 142,
    comments: 5,
    category: "weekend"
  },
  { 
    src: "/images/ugc/4.jpg", 
    title: "Date night", 
    description: "Zwarte blouse + tailored broek = elegant en zelfverzekerd",
    likes: 42,
    views: 287,
    comments: 15,
    category: "evening"
  },
];

const UGCGallery: React.FC<{ className?: string }> = ({ className = "" }) => {
  const handleImageClick = (item: typeof GALLERY_ITEMS[0], index: number) => {
    track('ugc_gallery_click', {
      image_index: index,
      category: item.category,
      title: item.title,
      likes: item.likes,
      views: item.views
    });
  };

  const handleCTAClick = () => {
    track('ugc_gallery_cta_click', {
      section: 'community_looks',
      cta_text: 'Ontdek je eigen stijl'
    });
  };

  return (
    <section 
      className={`section bg-gradient-to-b from-[color:var(--color-bg)] to-[color:var(--color-surface)] ${className}`} 
      aria-labelledby="ugc-title"
    >
      <div className="container">
        <header className="text-center max-w-3xl mx-auto">
          <h2 id="ugc-title" className="hero__title">Community looks</h2>
          <p className="lead mt-3">Outfits geïnspireerd door jouw profiel — met korte uitleg per look.</p>
        </header>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {GALLERY_ITEMS.map((item, index) => (
            <article 
              key={item.src} 
              className="card interactive-elevate overflow-hidden cursor-pointer group"
              onClick={() => handleImageClick(item, index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleImageClick(item, index);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Bekijk ${item.title} outfit`}
            >
              <div className="relative overflow-hidden">
                <SmartImage 
                  src={item.src} 
                  alt={`${item.title} outfit - ${item.description}`}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                
                {/* Overlay with stats */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center justify-between text-white text-sm">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {item.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {item.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {item.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category chip */}
                <div className="absolute top-3 left-3">
                  <span className="chip text-xs bg-white/90 text-gray-800 backdrop-blur-sm">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="card__inner">
                <h3 className="subcard__title group-hover:text-[color:var(--color-primary)] transition-colors duration-200">
                  {item.title}
                </h3>
                <p className="subcard__kicker mt-2">
                  <strong>Waarom dit werkt:</strong> {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <Link 
            to="/quiz" 
            className="btn btn-primary btn-lg group"
            onClick={handleCTAClick}
          >
            Ontdek je eigen stijl
            <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <p className="mt-3 text-sm muted">
            Start de quiz en krijg outfits met persoonlijke uitleg
          </p>
        </div>
      </div>
    </section>
  );
};

export default UGCGallery;