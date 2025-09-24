import React from "react";

type Props = {
  index: number;
  title: string;
  description: string;
};

export default function StepCard({ index, title, description }: Props) {
  return (
    <article className="ff-step ff-hover-raise">
      <span className="ff-step-index" aria-hidden="true">
        {index}
      </span>
      <h3 className="ff-step-title">{title}</h3>
      <p className="ff-step-desc">{description}</p>
    </article>
  );
}