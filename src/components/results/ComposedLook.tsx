import React from "react";
import SmartImage from "@/components/ui/SmartImage";

type ComposedLookItem = {
  img: string;
  alt: string;
};

type ComposedLookProps = {
  items: ComposedLookItem[];
};

const ComposedLook: React.FC<ComposedLookProps> = ({ items }) => {
  return (
    <div className="composed-look">
      {items.slice(0, 4).map((item, index) => (
        <SmartImage
          key={index}
          src={item.img}
          alt={item.alt}
          aspectRatio={1}
          className="composed-look__tile"
          fetchPriority={index === 0 ? "high" : "auto"}
        />
      ))}
    </div>
  );
};

export default ComposedLook;