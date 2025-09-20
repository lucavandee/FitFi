import React from "react";

type Props = {
  title: string;
  intro?: string;
  kicker?: string;
};

const BlogHeader: React.FC<Props> = ({ title, intro, kicker = "Blog" }) => {
  return (
    <header className="section-header">
      <p className="kicker">{kicker}</p>
      <h1 className="section-title">{title}</h1>
      {intro && <p className="section-intro">{intro}</p>}
    </header>
  );
};

export default BlogHeader;