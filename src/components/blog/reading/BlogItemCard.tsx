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
    <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 hover:shadow-[var(--shadow-lifted)] transition-shadow">
      {image && (
        <div className="aspect-square bg-[var(--ff-color-primary-50)] rounded-lg mb-4 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] flex items-center justify-center text-sm font-bold">
          {number}
        </span>
        <div className="flex-1">
          <h3 className="font-bold text-[var(--color-text)] text-lg leading-tight mb-1">
            {name}
          </h3>
          {color && (
            <p className="text-sm text-[var(--color-muted)] mb-2">
              Kleur: <span className="text-[var(--color-text)]">{color}</span>
            </p>
          )}
        </div>
      </div>

      <p className="text-[var(--color-muted)] text-sm leading-relaxed mb-4">
        {reason}
      </p>

      <div className="flex flex-wrap gap-2">
        {combinesWith.map((item, idx) => (
          <span
            key={idx}
            className="px-3 py-1 bg-[var(--ff-color-primary-50)] text-[var(--ff-color-primary-700)] rounded-full text-xs font-medium"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};
