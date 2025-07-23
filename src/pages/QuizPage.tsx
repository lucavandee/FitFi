import React from 'react';
import { useParams } from 'react-router-dom';
import Quiz from '../components/Quiz';

const QuizPage: React.FC = () => {
  const { step } = useParams<{ step: string }>();

  return (
    <div className="min-h-screen bg-light-grey py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-h1 font-bold text-text-primary mb-4">
              Ontdek je perfecte stijl
            </h1>
            <p className="text-text-secondary">
              Beantwoord enkele vragen en ontvang gepersonaliseerde stijladvies
            </p>
          </div>
          
          <Quiz />
        </div>
      </div>
    </div>
  );
};

export default QuizPage;