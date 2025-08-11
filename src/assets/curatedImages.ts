type Archetype = 'klassiek'|'casual_chic'|'urban'|'streetstyle'|'retro'|'luxury';
type Season = 'lente'|'zomer'|'herfst'|'winter';
type Gender = 'male'|'female'|'neutral';

const MAP: Record<Archetype, Record<Season, string[]>> = {
  klassiek: {
    lente: [
      'https://images.unsplash.com/photo-1516826957135-700dedea698c',
      'https://images.unsplash.com/photo-1520975916090-3105956dac38'
    ],
    zomer: ['https://images.unsplash.com/photo-1520975916090-3105956dac38'],
    herfst: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8'],
    winter: ['https://images.unsplash.com/photo-1520975916090-3105956dac38']
  },
  casual_chic: {
    lente: ['https://images.unsplash.com/photo-1520975916090-3105956dac38'],
    zomer: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d'],
    herfst: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8'],
    winter: ['https://images.unsplash.com/photo-1516826957135-700dedea698c']
  },
  urban: {
    lente: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d'],
    zomer: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f'],
    herfst: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d'],
    winter: ['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f']
  },
  streetstyle: { 
    lente: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f'], 
    zomer: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f'], 
    herfst: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d'], 
    winter: ['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f'] 
  },
  retro: { 
    lente: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8'], 
    zomer: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d'], 
    herfst: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8'], 
    winter: ['https://images.unsplash.com/photo-1516826957135-700dedea698c'] 
  },
  luxury: { 
    lente: ['https://images.unsplash.com/photo-1520975916090-3105956dac38'], 
    zomer: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d'], 
    herfst: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8'], 
    winter: ['https://images.unsplash.com/photo-1516826957135-700dedea698c'] 
  }
};

export function getCuratedImage(archetype: Archetype, season: Season, seed: string): string {
  const list = MAP[archetype]?.[season] || MAP.casual_chic.lente;
  const { seededPick } = require('../utils/seed');
  return seededPick(list, seed);
}