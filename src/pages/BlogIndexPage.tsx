import { Link } from 'react-router-dom'

function BlogIndexPage() {
  const posts = [
    { slug: 'styling-tips', title: 'De beste styling tips voor 2024', excerpt: 'Ontdek de trends die dit jaar belangrijk zijn.' },
    { slug: 'ai-fashion', title: 'Hoe AI de mode-industrie verandert', excerpt: 'Een kijk op de toekomst van fashion tech.' }
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-heading font-bold mb-8 text-midnight">
            FitFi Blog
          </h1>
          
          <div className="grid gap-8">
            {posts.map((post) => (
              <article key={post.slug} className="bg-surface p-6 rounded-2xl">
                <h2 className="text-xl font-semibold mb-2">
                  <Link to={`/blog/${post.slug}`} className="hover:text-accent transition-colors">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-600">{post.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogIndexPage