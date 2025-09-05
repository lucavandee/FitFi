function FeedPage() {
  const posts = [
    { id: 1, user: 'StyleGuru', content: 'Loving the new minimalist trend!', time: '2 uur geleden' },
    { id: 2, user: 'FashionFan', content: 'Check out my latest outfit inspiration', time: '4 uur geleden' },
    { id: 3, user: 'TrendSetter', content: 'Spring colors are everything this season', time: '6 uur geleden' }
  ]

  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-heading font-bold mb-8 text-midnight">
            Style Feed
          </h1>
          
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold text-sm">
                      {post.user.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{post.user}</div>
                    <div className="text-sm text-gray-500">{post.time}</div>
                  </div>
                </div>
                <p className="text-gray-700">{post.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeedPage