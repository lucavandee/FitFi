import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function OnboardingPage() {
  const [step, setStep] = useState(1)
  const navigate = useNavigate()
  
  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      navigate('/results')
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="max-w-md w-full mx-4 p-8 bg-white rounded-2xl shadow-lg">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">Stap {step} van 3</span>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i <= step ? 'bg-accent' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
          <h1 className="text-2xl font-heading font-semibold text-midnight">
            Laten we je stijl ontdekken
          </h1>
        </div>
        
        <div className="mb-8">
          <p className="text-gray-600">
            Stap {step}: Vertel ons meer over jouw voorkeuren
          </p>
        </div>
        
        <button onClick={handleNext} className="btn-primary w-full">
          {step < 3 ? 'Volgende' : 'Bekijk resultaten'}
        </button>
      </div>
    </div>
  )
}

export default OnboardingPage