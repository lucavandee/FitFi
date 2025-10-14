export class DataRouter {
  static async fetchOutfits(userId: string): Promise<any[]> {
    return [];
  }
  
  static async saveOutfit(userId: string, outfit: any): Promise<void> {
    console.log('Saving outfit for user:', userId);
  }
}

export default DataRouter;
