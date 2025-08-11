const MAP = {
  casual_chic: {
    lente: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d'],
    zomer: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f'],
    herfst: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8'],
    winter: ['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f']
  },
  urban: {
    lente: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f'],
    zomer: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f'],
    herfst: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d'],
    winter: ['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f']
  }
};

export function curatedImage(archetype = 'casual_chic', season = 'lente') {
  const list = (MAP as any)[archetype]?.[season] || (MAP.casual_chic.lente);
  return list[0];
}