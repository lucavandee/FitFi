import { useParams, Link } from 'react-router-dom'

function BlogDetailPage() {
  const { slug } = useParams()

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <Link to="/blog" className="text-accent hover:underline mb-8 inline-block">
            ← Terug naar blog
          </Link>
          
          <article>
            <h1 className="text-3xl font-heading font-bold mb-8 text-midnight">
              Blog Post: {slug}
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600">
                Dit is de inhoud van het blog post met slug: {slug}
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}

export default BlogDetailPage