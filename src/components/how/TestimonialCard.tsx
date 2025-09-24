import React from "react";

export default function TestimonialCard({ quote, author }: { quote: string; author: string; }) {
  return (
    <figure className="ff-card p-5 ff-hover-raise">
      <div aria-hidden className="text-text/60">"</div>
      <blockquote className="mt-3 text-text">{quote}</blockquote>
      <figcaption className="mt-4 text-sm text-text/70">— {author}</figcaption>
    </figure>
  );
}