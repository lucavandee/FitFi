import React from "react";
import { useParams } from "react-router-dom";
import Seo from "@/components/Seo";
import urls from "@/utils/urls";

// Bestaande imports:
import LoadingFallback from "@/components/ui/LoadingFallback";
// import { useBlogPost } from "@/hooks/useBlog"; etc.

const BlogDetailPage: React.FC = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  // Bestaande data-hook:
  // const { data: post, isLoading } = useBlogPost(slug);
  const post: any = undefined; // vervang door bestaande hook
  const isLoading = false;     // vervang door bestaande hook state

  if (isLoading) {
    return <LoadingFallback fullScreen message="Artikel laden..." />;
  }

  const title = post?.title ? `${post.title} — FitFi` : "Blog — FitFi";
  const description = post?.excerpt || "Lees meer over stijl, outfits en AI-gedreven styling.";
  const image = post?.imageUrl || `${urls.CANONICAL_HOST}/og-blog.jpg`;

  return (
    <>
      <Seo
        title={title}
        description={description}
        image={image}
        canonical={`/blog/${slug}`}
        jsonLd={
          post && {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            image,
            url: urls.canonicalUrl(`/blog/${slug}`),
            author: post.author ? [{ "@type": "Person", name: post.author }] : undefined,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt || post.publishedAt,
          }
        }
      />

      <main className="max-w-4xl mx-auto py-12 px-4 md:px-8 lg:px-16 bg-[var(--color-bg)]">
        {/* Bestaande blog content UI ongewijzigd */}
        {/* <ArticleView post={post} /> etc. */}
      </main>
    </>
  );
};

export default BlogDetailPage;