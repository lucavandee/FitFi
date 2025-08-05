/**
 * Realtime Collaboration Service
 * Handles real-time updates and collaboration features
 */

interface CollaborationUpdate {
  userId: string;
  type: 'referral' | 'achievement' | 'level_up' | 'post';
  data: any;
  timestamp: number;
  referralCount?: number;
}

type UpdateCallback = (update: CollaborationUpdate) => void;

export class RealtimeCollaboration {
  private userId?: string;
  private callbacks: UpdateCallback[] = [];
  private isConnected: boolean = false;

  /**
   * Set the current user ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
    this.connect();
  }

  /**
   * Subscribe to real-time updates
   */
  onUpdate(callback: UpdateCallback): () => void {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Connect to real-time updates
   */
  private connect(): void {
    if (this.isConnected || !this.userId) return;
    
    this.isConnected = true;
    
    // Simulate real-time updates for demo
    this.simulateUpdates();
  }

  /**
   * Disconnect from real-time updates
   */
  disconnect(): void {
    this.isConnected = false;
  }

  /**
   * Broadcast an update to all subscribers
   */
  private broadcastUpdate(update: CollaborationUpdate): void {
    this.callbacks.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error in collaboration callback:', error);
      }
    });
  }

  /**
   * Simulate real-time updates for demo purposes
   */
  private simulateUpdates(): void {
    // Simulate periodic updates
    setInterval(() => {
      if (!this.isConnected || !this.userId) return;
      
      // Simulate referral count update
      const update: CollaborationUpdate = {
        userId: this.userId,
        type: 'referral',
        data: { action: 'referral_signup' },
        timestamp: Date.now(),
        referralCount: Math.floor(Math.random() * 5)
      };
      
      this.broadcastUpdate(update);
    }, 30000); // Every 30 seconds
  }

  /**
   * Send a collaboration event
   */
  sendUpdate(type: CollaborationUpdate['type'], data: any): void {
    if (!this.userId) return;
    
    const update: CollaborationUpdate = {
      userId: this.userId,
      type,
      data,
      timestamp: Date.now()
    };
    
    this.broadcastUpdate(update);
  }
}

// Singleton instance
export const realtimeCollaboration = new RealtimeCollaboration();

export default realtimeCollaboration;