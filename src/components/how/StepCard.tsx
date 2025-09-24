// /src/components/how/StepCard.tsx
import React from "react";

type Props = {
  index: number;
  title: string;
  description: string;
};

const StepCard: React.FC<Props> = ({ index, title, description }) => {
  return (
    <article className="ff-step ff-hover-raise">
      <span className="ff-step-index" aria-hidden>
        {index}
      </span>
      <h3 className="ff-step-title">{title}</h3>
      <p className="ff-step-desc">{description}</p>
    </article>
  );
};

export default StepCard;