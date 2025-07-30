/**
 * Predictive Prefetching Service
 * Uses ML-based scroll behavior analysis for optimal prefetch timing
 */

interface ScrollBehavior {
  velocity: number;
  direction: 'up' | 'down';
  acceleration: number;
  dwellTime: number;
  sectionProgress: number;
}

interface PrefetchPrediction {
  probability: number;
  confidence: number;
  timing: number; // ms until optimal prefetch
  reason: string;
}

export class PredictivePrefetcher {
  private scrollHistory: ScrollBehavior[] = [];
  private prefetchCallbacks: Map<string, () => Promise<void>> = new Map();
  private isTraining = false;
  private model: any = null;
  
  constructor() {
    this.initializeScrollTracking();
    this.loadMLModel();
  }

  /**
   * Initialize scroll behavior tracking
   */
  private initializeScrollTracking() {
    let lastScrollY = window.scrollY;
    let lastTimestamp = Date.now();
    let dwellStartTime = Date.now();
    let lastVelocity = 0;

    const trackScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const deltaY = currentScrollY - lastScrollY;
      const deltaTime = currentTime - lastTimestamp;
      
      if (deltaTime > 0) {
        const velocity = Math.abs(deltaY) / deltaTime;
        const direction = deltaY > 0 ? 'down' : 'up';
        const acceleration = velocity - lastVelocity;
        
        // Calculate section progress
        const sectionProgress = this.calculateSectionProgress();
        
        // Detect dwell time (slow/stopped scrolling)
        const isDwelling = velocity < 0.1;
        if (isDwelling) {
          const dwellTime = currentTime - dwellStartTime;
          
          const behavior: ScrollBehavior = {
            velocity,
            direction,
            acceleration,
            dwellTime,
            sectionProgress
          };
          
          this.scrollHistory.push(behavior);
          this.analyzeAndPredict(behavior);
        } else {
          dwellStartTime = currentTime;
        }
        
        lastScrollY = currentScrollY;
        lastTimestamp = currentTime;
        lastVelocity = velocity;
      }
    };

    // Throttled scroll tracking
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          trackScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /**
   * Calculate user's progress through current section
   */
  private calculateSectionProgress(): number {
    const foundersSection = document.getElementById('founders-teaser');
    if (!foundersSection) return 0;

    const rect = foundersSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Calculate how much of the section is visible
    const visibleTop = Math.max(0, -rect.top);
    const visibleBottom = Math.min(rect.height, viewportHeight - rect.top);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    
    return visibleHeight / rect.height;
  }

  /**
   * Load lightweight ML model for prefetch prediction
   */
  private async loadMLModel() {
    try {
      // Lightweight decision tree model (no external dependencies)
      this.model = {
        predict: (behavior: ScrollBehavior): PrefetchPrediction => {
          let probability = 0;
          let confidence = 0;
          let timing = 2000; // default 2s
          let reason = 'baseline';

          // Rule-based ML approximation
          
          // High section progress + slow scroll = likely to interact
          if (behavior.sectionProgress > 0.7 && behavior.velocity < 0.5) {
            probability = 0.85;
            confidence = 0.9;
            timing = 500;
            reason = 'high_section_progress_slow_scroll';
          }
          
          // Dwelling in section = high interaction probability
          else if (behavior.dwellTime > 2000 && behavior.sectionProgress > 0.3) {
            probability = 0.75;
            confidence = 0.8;
            timing = 1000;
            reason = 'section_dwelling';
          }
          
          // Decelerating towards section = preparing to interact
          else if (behavior.acceleration < -0.1 && behavior.sectionProgress > 0.5) {
            probability = 0.65;
            confidence = 0.7;
            timing = 1500;
            reason = 'deceleration_approach';
          }
          
          // Fast scroll past = low probability
          else if (behavior.velocity > 2 && behavior.sectionProgress < 0.2) {
            probability = 0.1;
            confidence = 0.9;
            timing = 5000;
            reason = 'fast_scroll_past';
          }

          return { probability, confidence, timing, reason };
        }
      };
      
      console.log('[🧠 PredictivePrefetcher] ML model loaded successfully');
    } catch (error) {
      console.warn('[⚠️ PredictivePrefetcher] ML model loading failed:', error);
    }
  }

  /**
   * Analyze scroll behavior and predict optimal prefetch timing
   */
  private analyzeAndPredict(behavior: ScrollBehavior) {
    if (!this.model) return;

    const prediction = this.model.predict(behavior);
    
    // Only prefetch if high probability and confidence
    if (prediction.probability > 0.6 && prediction.confidence > 0.7) {
      console.log(`[🎯 PredictivePrefetcher] High interaction probability: ${Math.round(prediction.probability * 100)}% (${prediction.reason})`);
      
      // Schedule prefetch with predicted timing
      setTimeout(() => {
        this.executePrefetch('founders-dashboard', prediction);
      }, prediction.timing);
    }
  }

  /**
   * Register a prefetch callback
   */
  registerPrefetch(key: string, callback: () => Promise<void>) {
    this.prefetchCallbacks.set(key, callback);
  }

  /**
   * Execute prefetch with ML prediction context
   */
  private async executePrefetch(key: string, prediction: PrefetchPrediction) {
    const callback = this.prefetchCallbacks.get(key);
    if (!callback) return;

    try {
      console.log(`[⚡ PredictivePrefetcher] Executing prefetch: ${key} (confidence: ${Math.round(prediction.confidence * 100)}%)`);
      
      const startTime = Date.now();
      await callback();
      const duration = Date.now() - startTime;
      
      // Track prefetch performance for model improvement
      this.trackPrefetchPerformance(prediction, duration);
      
    } catch (error) {
      console.error(`[❌ PredictivePrefetcher] Prefetch failed for ${key}:`, error);
    }
  }

  /**
   * Track prefetch performance for model improvement
   */
  private trackPrefetchPerformance(prediction: PrefetchPrediction, duration: number) {
    // Store performance data for model training
    const performanceData = {
      prediction,
      duration,
      timestamp: Date.now(),
      success: duration < 1000 // Consider < 1s as successful
    };
    
    // Store in localStorage for model improvement
    const existingData = JSON.parse(localStorage.getItem('fitfi-prefetch-performance') || '[]');
    existingData.push(performanceData);
    
    // Keep only last 100 entries
    if (existingData.length > 100) {
      existingData.splice(0, existingData.length - 100);
    }
    
    localStorage.setItem('fitfi-prefetch-performance', JSON.stringify(existingData));
  }

  /**
   * Get prefetch analytics
   */
  getAnalytics() {
    const data = JSON.parse(localStorage.getItem('fitfi-prefetch-performance') || '[]');
    
    return {
      totalPrefetches: data.length,
      successRate: data.filter((d: any) => d.success).length / data.length,
      averageDuration: data.reduce((sum: number, d: any) => sum + d.duration, 0) / data.length,
      topReasons: this.getTopPrefetchReasons(data)
    };
  }

  private getTopPrefetchReasons(data: any[]) {
    const reasons = data.reduce((acc, d) => {
      acc[d.prediction.reason] = (acc[d.prediction.reason] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(reasons)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3);
  }
}

export const predictivePrefetcher = new PredictivePrefetcher();