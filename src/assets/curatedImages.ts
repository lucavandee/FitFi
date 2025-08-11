const MAP = {
  casual_chic: {
    lente: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=960&q=75'],
    zomer: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=960&q=75'],
    herfst: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=960&q=75'],
    winter: ['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=960&q=75']
  },
  urban: {
    lente: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=960&q=75'],
    zomer: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=960&q=75'],
    herfst: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=960&q=75'],
    winter: ['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=960&q=75']
  }
};

export function curatedImage(archetype = 'casual_chic', season = 'lente') {
  const list = (MAP as any)[archetype]?.[season] || (MAP.casual_chic.lente);
  return list[0];
}