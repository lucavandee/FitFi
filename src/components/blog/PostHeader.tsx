import React from "react";

type Props = {
  title: string;
  excerpt?: string;
  date?: string;       // bv. "16 sep 2025"
  readingTime?: string; // bv. "4 min"
};

const PostHeader: React.FC<Props> = ({ title, excerpt, date, readingTime }) => {
  return (
    <header className="section-header">
      <p className="kicker">Blog</p>
      <h1 className="section-title">{title}</h1>
      {excerpt && <p className="section-intro">{excerpt}</p>}
      {(date || readingTime) && (
        <p className="text-sm opacity-70 mt-1">
          {date || ""}{date && readingTime ? " · " : ""}{readingTime || ""}
        </p>
      )}
    </header>
  );
};

export default PostHeader;