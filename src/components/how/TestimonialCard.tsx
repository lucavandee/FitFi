// /src/components/how/TestimonialCard.tsx
import React from "react";
import { Quote } from "lucide-react";

type Props = {
  quote: string;
  author: string;
  role?: string;
};

const TestimonialCard: React.FC<Props> = ({ quote, author, role }) => {
  return (
    <figure className="ff-card p-5 ff-hover-raise">
      <Quote aria-hidden className="w-5 h-5 text-text/60" />
      <blockquote className="mt-3 text-text">{quote}</blockquote>
      <figcaption className="mt-4 text-sm text-text/70">
        <span className="font-medium">{author}</span>
        {role ? <span className="ml-1">• {role}</span> : null}
      </figcaption>
    </figure>
  );
};

export default TestimonialCard;