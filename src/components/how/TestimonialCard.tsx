import React from "react";

export default function TestimonialCard({
  quote, author, role
}: { quote: string; author: string; role?: string }) {
  return (
    <figure className="bg-white border border-[#E5E5E5] rounded-2xl p-6 p-5">
      <blockquote className="mt-1 text-text">{quote}</blockquote>
      <figcaption className="mt-3 text-sm text-text/70">
        <span className="font-medium">{author}</span>{role ? <span> • {role}</span> : null}
      </figcaption>
    </figure>
  );
}