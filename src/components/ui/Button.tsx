@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .card {
    @apply bg-accent text-text-dark p-6 rounded-2xl shadow-lg space-y-6;
  }
  
  .quiz-container {
    @apply bg-accent text-text-dark max-w-2xl mx-auto p-6 rounded-2xl shadow-lg;
  }
  
  .card-section {
    @apply bg-accent p-6 rounded-2xl shadow-lg space-y-6 text-text-dark;
  }
  
  .input {
    @apply w-full p-6 rounded-2xl border border-gray-300 bg-white text-text-dark placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary transition-all;
  }
  
  .btn-primary {
    @apply bg-secondary text-primary py-4 px-8 rounded-full font-medium text-lg shadow-lg hover:bg-secondary/90 focus:outline-none focus:ring-4 focus:ring-secondary/50 transition-all;
  }
  
  .btn-secondary {
    @apply bg-primary text-secondary border border-secondary py-3 px-6 rounded-full font-medium hover:bg-primary-light hover:text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-all;
  }
  
  .btn-ghost {
    @apply bg-transparent text-body py-3 px-6 rounded-full border border-primary-light hover:bg-primary-light hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary transition-all;
  }
  
  .btn-danger {
    @apply bg-red-600 text-white py-3 px-6 rounded-full font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all;
  }
  
  .quiz-button {
    @apply bg-secondary text-primary py-3 px-6 rounded-full