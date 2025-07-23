import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Send } from 'lucide-react';
import Button from '../ui/Button';

interface FeedbackSectionProps {
  className?: string;
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ className = '' }) => {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFeedbackSubmit = () => {
    if (feedback || comment.trim()) {
      // In real app, this would send to analytics/backend
      console.log('Feedback submitted:', { feedback, comment });
      setIsSubmitted(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFeedback(null);
        setComment('');
      }, 3000);
    }
  };

  if (isSubmitted) {
    return (
      <section className={`bg-white rounded-3xl p-8 shadow-sm ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <ThumbsUp className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Bedankt voor je feedback!
          </h3>
          <p className="text-gray-600">
            Jouw input helpt Nova om nog beter te worden.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={`bg-white rounded-3xl p-8 shadow-sm ${className}`} aria-labelledby="feedback-heading">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h2 id="feedback-heading" className="text-2xl font-light text-gray-900">
            Feedback & Interactie
          </h2>
          <p className="text-gray-600">Help Nova om jou beter te begrijpen</p>
        </div>
      </div>

      {/* Quick Feedback */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-4">Heeft Nova het goed?</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => setFeedback('positive')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl border-2 transition-all ${
              feedback === 'positive'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-green-300 text-gray-600'
            }`}
            aria-label="Positieve feedback geven"
          >
            <ThumbsUp size={20} />
            <span className="font-medium">Ja, perfect!</span>
          </button>
          
          <button
            onClick={() => setFeedback('negative')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl border-2 transition-all ${
              feedback === 'negative'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 hover:border-red-300 text-gray-600'
            }`}
            aria-label="Negatieve feedback geven"
          >
            <ThumbsDown size={20} />
            <span className="font-medium">Kan beter</span>
          </button>
        </div>
      </div>

      {/* Comment Section */}
      <div className="mb-6">
        <label htmlFor="feedback-comment" className="block font-medium text-gray-900 mb-3">
          Vertel ons hoe we jouw stijl beter kunnen begrijpen
        </label>
        <textarea
          id="feedback-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Bijvoorbeeld: Ik hou van meer kleur in mijn outfits, of Nova raadt te vaak formele kleding aan..."
          className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-[#bfae9f] focus:border-[#bfae9f] transition-colors"
          rows={4}
          maxLength={500}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            {comment.length}/500 karakters
          </span>
          <Button
            variant="primary"
            size="sm"
            icon={<Send size={16} />}
            iconPosition="right"
            onClick={handleFeedbackSubmit}
            disabled={!feedback && !comment.trim()}
            className="bg-[#bfae9f] hover:bg-[#a89a8c] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Verstuur feedback
          </Button>
        </div>
      </div>

      {/* Feedback Incentive */}
      <div className="bg-gradient-to-r from-[#bfae9f]/10 to-blue-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">
          💡 <span className="font-medium">Pro tip:</span> Hoe meer je Nova vertelt over je voorkeuren, 
          hoe nauwkeuriger de aanbevelingen worden!
        </p>
      </div>
    </section>
  );
};

export default FeedbackSection;