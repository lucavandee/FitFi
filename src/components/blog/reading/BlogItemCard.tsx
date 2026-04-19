import React from 'react';

interface BlogItemCardProps {
  number: number;
  name: string;
  color?: string;
  reason: string;
  combinesWith: string[];
  image?: string;
}

export const BlogItemCard: React.FC<BlogItemCardProps> = ({
  number,
  name,
  color,
  reason,
  combinesWith,
  image
}) => {
  return (
    <div className="bg-[#FFFFFF] border-2 border-[#E5E5E5] rounded-2xl p-6 hover:shadow-md transition-shadow">
      {image && (
        <div className="aspect-square bg-[#FAF5F2] rounded-lg mb-4 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FAF5F2] text-[#A8513A] flex items-center justify-center text-sm font-bold">
          {number}
        </span>
        <div className="flex-1">
          <h3 className="font-bold text-[#1A1A1A] text-lg leading-tight mb-1">
            {name}
          </h3>
          {color && (
            <p className="text-sm text-[#8A8A8A] mb-2">
              Kleur: <span className="text-[#1A1A1A]">{color}</span>
            </p>
          )}
        </div>
      </div>

      <p className="text-[#8A8A8A] text-sm leading-relaxed mb-4">
        {reason}
      </p>

      <div className="flex flex-wrap gap-2">
        {combinesWith.map((item, idx) => (
          <span
            key={idx}
            className="px-3 py-1 bg-[#FAF5F2] text-[#A8513A] rounded-full text-xs font-medium"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};
