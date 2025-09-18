import React from "react";
import { Link } from "react-router-dom";
import SmartImage from "@/components/media/SmartImage";
import type { BlogPost } from "@/data/blogPosts";

type Props = { post: BlogPost };

const BlogCard: React.FC<Props> = ({ post }) => {
  const [open, setOpen] = React.useState(false);
  const dt = new Date(post.date);
  const pretty = dt.toLocaleDateString("nl-NL", { year: "numeric", month: "long", day: "numeric" });

  return (
    <article className="blog-card card card-hover flow-sm" aria-labelledby={`post-${post.id}`}>
      <div className="blog-media">
        {post.imageId ? (
          <SmartImage
            id={post.imageId}
            kind="generic"
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="blog-media-fallback" aria-hidden />
        )}
      </div>

      <header className="blog-head flow-xs">
        <time className="blog-date" dateTime={post.date}>{pretty}</time>
        <h3 id={`post-${post.id}`} className="card-title">
          <Link className="underlined" to={`/blog/${post.id}`} aria-label={`Lees artikel: ${post.title}`}>
            {post.title}
          </Link>
        </h3>
        <ul className="blog-tags" aria-label="Tags">
          {post.tags.map((t) => (
            <li key={t} className="tag-chip">{t}</li>
          ))}
        </ul>
      </header>

      <p className="card-text">{post.excerpt}</p>

      {/* Inline reader (geen extra route nodig) */}
      {open && (
        <div className="blog-content">
          <p className="card-text">{post.content}</p>
        </div>
      )}

      <div className="cluster">
        <button
          className="btn btn-sm"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={`content-${post.id}`}
        >
          {open ? "Minder lezen" : "Lees meer"}
        </button>
        <Link className="share-link" to={`/blog/${post.id}`} aria-label={`Lees artikel: ${post.title}`}>
          Lees artikel
        </Link>
      </div>
    </article>
  );
};

export default BlogCard;