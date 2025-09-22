import React from "react";
import SmartImage from "@/components/ui/SmartImage";
import { useInView } from "@/hooks/useInView";

interface OutfitCardProps {
  title: string;
  description: string[];
  images: string[];
  shopLink?: string;
  className?: string;
}

const OutfitCard: React.FC<OutfitCardProps> = ({
  title,
  description,
  images,
  shopLink = "#shop",
  className = ""
}) => {
  const { ref, inView } = useInView<HTMLDivElement>();

  // Ensure we have 4 images for the 2x2 grid
  const gridImages = [...images];
  while (gridImages.length < 4) {
    gridImages.push("/images/outfit-fallback.jpg");
  }

  return (
    <article 
      ref={ref} 
      className={`res-card ${inView ? 'in' : ''} ${className}`}
    >
      <div className="res-img-grid">
        <div style={{ position: 'relative' }}>
          <SmartImage 
            className="res-img" 
            src={gridImages[0]} 
            alt="" 
            loading="lazy"
            decoding="async"
          />
          <span className="res-overlay" aria-hidden="true"></span>
        </div>
        <SmartImage 
          className="res-img" 
          src={gridImages[1]} 
          alt="" 
          loading="lazy"
          decoding="async"
        />
        <SmartImage 
          className="res-img" 
          src={gridImages[2]} 
          alt="" 
          loading="lazy"
          decoding="async"
        />
        <SmartImage 
          className="res-img" 
          src={gridImages[3]} 
          alt="" 
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="res-card-footer">
        <h3>{title}</h3>
        <ul className="res-bullets">
          {description.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <a className="res-shoplink" href={shopLink}>
          Shop vergelijkbare items
        </a>
      </div>
    </article>
  );
};

export default OutfitCard;