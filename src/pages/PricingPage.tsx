import { Link } from 'react-router-dom'

function PricingPage() {
  const plans = [
    {
      name: 'Visitor',
      price: 'Gratis',
      features: ['Basis stijladvies', 'Beperkte AI chats', 'Community toegang']
    },
    {
      name: 'Member',
      price: '€9/maand',
      features: ['Onbeperkte AI chats', 'Persoonlijke styling', 'Premium content']
    },
    {
      name: 'Plus',
      price: '€19/maand',
      features: ['Alles van Member', 'Prioriteit support', 'Exclusieve features']
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-3xl font-heading font-bold mb-4 text-midnight">
              Kies jouw plan
            </h1>
            <p className="text-lg text-gray-600">
              Start gratis en upgrade wanneer je klaar bent voor meer.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div key={plan.name} className={`p-8 rounded-2xl ${index === 1 ? 'bg-midnight text-white' : 'bg-surface'}`}>
                <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
                <div className="text-2xl font-bold mb-6">{plan.price}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <span className="mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link 
                  to="/onboarding" 
                  className={`block text-center py-3 px-6 rounded-xl font-medium transition-colors ${
                    index === 1 ? 'bg-white text-midnight hover:bg-gray-100' : 'bg-midnight text-white hover:opacity-90'
                  }`}
                >
                  Start nu
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingPage