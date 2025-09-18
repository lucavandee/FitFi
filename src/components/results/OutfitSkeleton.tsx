import React from "react";

const OutfitSkeleton: React.FC = () => {
  return (
    <article className="outfit-card">
      <div className="outfit-media skeleton" aria-hidden="true" />
      <div className="outfit-body">
        <div className="skeleton h-6 w-1/2 mb-3" />
        <div className="skeleton h-5 w-2/3 mb-2" />
        <div className="skeleton h-4 w-full mb-1" />
        <div className="skeleton h-4 w-5/6 mb-4" />
        <div className="skeleton h-9 w-40" />
      </div>
    </article>
  );
};

export default OutfitSkeleton;