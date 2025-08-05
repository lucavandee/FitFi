/**
 * Predictive Prefetcher Service
 * Intelligently prefetches data based on user behavior patterns
 */

interface PrefetchTask {
  id: string;
  priority: 'low' | 'medium' | 'high';
  executor: () => Promise<any>;
  timeout: number;
  retries: number;
}

export class PredictivePrefetcher {
  private tasks: Map<string, PrefetchTask> = new Map();
  private isRunning: boolean = false;
  private prefetchQueue: string[] = [];

  /**
   * Register a prefetch task
   */
  registerPrefetch(
    id: string, 
    executor: () => Promise<any>, 
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): void {
    this.tasks.set(id, {
      id,
      priority,
      executor,
      timeout: 5000,
      retries: 2
    });
  }

  /**
   * Execute prefetch task
   */
  async executePrefetch(id: string): Promise<any> {
    const task = this.tasks.get(id);
    if (!task) {
      console.warn(`Prefetch task ${id} not found`);
      return null;
    }

    try {
      return await task.executor();
    } catch (error) {
      console.warn(`Prefetch task ${id} failed:`, error);
      return null;
    }
  }

  /**
   * Start prefetching based on user behavior
   */
  startPredictivePrefetching(): void {
    this.isRunning = true;
    
    // Monitor user interactions for prefetch triggers
    this.setupBehaviorMonitoring();
  }

  /**
   * Stop prefetching
   */
  stopPredictivePrefetching(): void {
    this.isRunning = false;
  }

  private setupBehaviorMonitoring(): void {
    // Monitor hover events for prefetch triggers
    document.addEventListener('mouseover', (event) => {
      if (!this.isRunning) return;
      
      const target = event.target as HTMLElement;
      const prefetchId = target.dataset.prefetch;
      
      if (prefetchId && this.tasks.has(prefetchId)) {
        this.queuePrefetch(prefetchId);
      }
    });
  }

  private queuePrefetch(id: string): void {
    if (!this.prefetchQueue.includes(id)) {
      this.prefetchQueue.push(id);
      
      // Execute after a short delay
      setTimeout(() => {
        this.executePrefetch(id);
        this.prefetchQueue = this.prefetchQueue.filter(taskId => taskId !== id);
      }, 100);
    }
  }
}

// Singleton instance
export const predictivePrefetcher = new PredictivePrefetcher();

export default predictivePrefetcher;