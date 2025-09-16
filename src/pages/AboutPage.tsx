import React from "react";

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Over FitFi</h1>
            <p className="text-xl text-gray-600">
              Wij maken persoonlijke styling toegankelijk voor iedereen met de kracht van AI
            </p>
          </div>
          
          <div className="prose prose-lg mx-auto">
            <p>
              FitFi is ontstaan uit de overtuiging dat iedereen recht heeft op een stijl die bij hen past. 
              Onze AI-gedreven platform analyseert jouw unieke voorkeuren, lichaamsbouw en levensstijl 
              om outfits te creëren die perfect bij jou passen.
            </p>
            
            <h2>Onze Missie</h2>
            <p>
              We geloven dat de juiste kleding je zelfvertrouwen kan versterken en je helpt om je beste 
              zelf te zijn. Daarom hebben we een platform ontwikkeld dat persoonlijke styling democratiseert 
              en voor iedereen toegankelijk maakt.
            </p>
            
            <h2>Hoe het werkt</h2>
            <p>
              Onze geavanceerde AI-algoritmes analyseren duizenden datapunten om outfits te creëren die 
              niet alleen mooi zijn, maar ook praktisch en betaalbaar. Van casual tot formeel, 
              wij hebben de perfecte look voor elke gelegenheid.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;