export async function generateEmbedding(imageUrl: string): Promise<number[]> {
  return Array(512).fill(0);
}

export async function saveEmbedding(userId: string, embedding: number[]): Promise<void> {
  console.log('Saving embedding for user:', userId);
}

export async function getUserEmbedding(userId: string): Promise<number[] | null> {
  return null;
}
