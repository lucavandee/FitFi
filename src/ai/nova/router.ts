import { parseUserText, ParsedQuery } from './nlu';
import { getRecommendedProducts } from '@/services/DataRouter';
import { getCurrentSeason } from '@/engine/helpers';
import type { Season } from '@/engine/types';

export type NovaContext = {
  userId?: string;
  gender?: 'male'|'female'|'unisex';
  profile?: any; // jullie profielstructuur
};

export type NovaReply =
  | { type: 'capabilities'; text: string }
  | { type: 'smalltalk'; text: string }
  | { type: 'outfits'; text: string; outfits: any[] }
  | { type: 'clarify'; text: string; options: string[] };

export async function routeMessage(text: string, ctx: NovaContext): Promise<NovaReply> {
  const q = parseUserText(text);

  switch (q.intent) {
    case 'info.capabilities':
      return {
        type: 'capabilities',
        text:
`Ik kan:
• outfits samenstellen (casual, smart casual, formeel)
• rekening houden met kleur, seizoen en gelegenheid
• looks bewaren of "meer zoals dit" tonen
Noem bv.: "smart casual zwart voor kantoor in zomer".`
      };

    case 'smalltalk':
      return { 
        type: 'smalltalk', 
        text: 'Hey! Zin in iets casual, smart casual of formeel? Je mag ook kleuren of een gelegenheid noemen 😊' 
      };

    case 'outfit.refine':
    case 'outfit.request': {
      try {
        const currentSeason: Season = (q.season ?? getCurrentSeason()) as Season;
        
        // Create mock user profile for recommendations
        const mockProfile = ctx.profile || {
          id: ctx.userId || 'nova-user',
          name: 'Nova User',
          email: '',
          gender: ctx.gender || 'female',
          stylePreferences: {
            casual: q.styleLevel === 'casual' ? 5 : 3,
            formal: q.styleLevel === 'formeel' ? 5 : 3,
            sporty: 2,
            vintage: 2,
            minimalist: q.styleLevel === 'smart casual' ? 4 : 3
          },
          isPremium: false,
          savedRecommendations: []
        };

        // Get recommended products/outfits
        const products = await getRecommendedProducts(
          mockProfile,
          3, // count
          currentSeason
        );

        // Convert products to outfit-like structure for display
        const outfits = products.map((product, index) => ({
          id: `nova-outfit-${index}`,
          title: `${q.styleLevel || 'Casual'} look ${index + 1}`,
          description: `${product.name} ${q.colors?.length ? `in ${q.colors.join('/')}` : ''}`,
          imageUrl: product.imageUrl,
          products: [product],
          archetype: q.styleLevel === 'formeel' ? 'klassiek' : 
                    q.styleLevel === 'smart casual' ? 'casual_chic' : 'urban',
          occasion: q.occasion || 'Casual',
          matchPercentage: 85 + Math.floor(Math.random() * 10),
          tags: [
            ...(q.colors || []),
            q.styleLevel || 'casual',
            q.occasion || 'everyday'
          ].filter(Boolean)
        }));

        if (!outfits || outfits.length === 0) {
          return {
            type: 'clarify',
            text: 'Ik vond niets met deze combinatie. Wil je het specifieker maken?',
            options: ['Smart casual zwart', 'Formeel navy', 'Casual weekend beige']
          };
        }

        // Titeltekst met constraints
        const pieces: string[] = [];
        if (q.styleLevel) pieces.push(q.styleLevel);
        if (q.colors?.length) pieces.push(q.colors.join(', '));
        if (q.occasion) pieces.push(q.occasion);
        if (q.season) pieces.push(q.season);
        const head = pieces.length ? `Outfits: ${pieces.join(' • ')}` : 'Outfits voor jou';

        return { type: 'outfits', text: head, outfits };
      } catch (error) {
        console.error('[Nova Router] Error generating outfits:', error);
        
        return {
          type: 'clarify',
          text: 'Sorry, ik kon geen outfits genereren. Probeer het iets anders te formuleren.',
          options: ['Casual outfit', 'Smart casual look', 'Formele outfit']
        };
      }
    }

    default:
      return { 
        type: 'smalltalk', 
        text: 'Ik begrijp je niet helemaal. Probeer: "casual outfit", "smart casual zwart" of "formeel voor werk".' 
      };
  }
}