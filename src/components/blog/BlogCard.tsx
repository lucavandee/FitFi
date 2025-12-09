import React from "react";
import { Link } from "react-router-dom";
import SmartImage from "@/components/media/SmartImage";
import type { BlogPost } from "@/services/blog/blogService";

type Props = { post: BlogPost };

const BlogCard: React.FC<Props> = ({ post }) => {
  const [open, setOpen] = React.useState(false);
  const dt = new Date(post.published_at || post.created_at);
  const pretty = dt.toLocaleDateString("nl-NL", { year: "numeric", month: "long", day: "numeric" });

  return (
    <article className="blog-card card card-hover flow-sm" aria-labelledby={`post-${post.id}`}>
      <div className="blog-media">
        {post.featured_image_url ? (
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="blog-content">
        <p className="blog-meta">{pretty} · {post.read_time_minutes} min</p>
        <h3 id={`post-${post.id}`} className="blog-title">{post.title}</h3>
        <p className="blog-excerpt">{post.excerpt}</p>

        {open && (
          <div id={`content-${post.id}`} className="blog-more">
            <p>{post.excerpt}</p>
          </div>
        )}

        <div className="blog-actions">
          <button
            className="btn btn-sm ghost"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={`content-${post.id}`}
          >
            {open ? "Minder lezen" : "Lees meer"}
          </button>
          <Link className="share-link" to={`/blog/${post.slug}`} aria-label={`Lees artikel: ${post.title}`}>
            Lees artikel
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;