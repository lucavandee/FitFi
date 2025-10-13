import type { Product, Gender } from '@/types/product';

export function filterByGender(
  products: Product[],
  preferredGender: Gender
): Product[] {
  return products.filter(product => {
    if (product.gender === 'unisex') {
      return true;
    }
    return product.gender === preferredGender;
  });
}

export function getUserGender(): Gender {
  try {
    const styleProfileStr = localStorage.getItem('ff_style_profile');
    if (styleProfileStr) {
      const profile = JSON.parse(styleProfileStr);
      if (profile.gender === 'male' || profile.gender === 'female') {
        return profile.gender;
      }
    }

    const quizAnswersStr = localStorage.getItem('ff_quiz_answers');
    if (quizAnswersStr) {
      const answers = JSON.parse(quizAnswersStr);
      if (answers.gender === 'male' || answers.gender === 'female') {
        return answers.gender;
      }
    }
  } catch (error) {
    console.warn('[GenderFilter] Error reading gender preference:', error);
  }

  return 'unisex';
}

export function getGenderLabel(gender: Gender): string {
  const labels: Record<Gender, string> = {
    male: 'Heren',
    female: 'Dames',
    unisex: 'Unisex',
  };
  return labels[gender] || 'Unisex';
}
