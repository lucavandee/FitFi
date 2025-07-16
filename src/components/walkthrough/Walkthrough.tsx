import React from 'react';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';

interface WalkthroughProps {
  className?: string;
}

const Walkthrough: React.FC<WalkthroughProps> = ({ className = '' }) => {
  return (
    <div className={`max-w-6xl mx-auto px-4 py-12 ${className}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Hoe FitFi werkt
        </h2>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          In drie eenvoudige stappen naar jouw perfecte stijl
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <StepOne />
        <StepTwo />
        <StepThree />
      </div>
    </div>
  );
};

export default Walkthrough;