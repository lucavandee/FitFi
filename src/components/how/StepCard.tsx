import React from "react";

export default function StepCard({ index, title, description }: { index: number; title: string; description: string; }) {
  return (
    <article className="ff-step ff-hover-raise">
      <span className="ff-step-index" aria-hidden>{index}</span>
      <h3 className="ff-step-title">{title}</h3>
      <p className="ff-step-desc">{description}</p>
    </article>
  );
}