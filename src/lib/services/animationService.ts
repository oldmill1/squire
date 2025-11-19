export interface AnimationOptions {
  duration?: number;
  easing?: EasingFunction;
}

export type EasingFunction = (progress: number) => number;

export class AnimationService {
  private animationFrame: number | null = null;

  // Predefined easing functions
  static easingFunctions = {
    easeInOutCubic: (progress: number): number => {
      return progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    },
    linear: (progress: number): number => progress,
    easeIn: (progress: number): number => progress * progress,
    easeOut: (progress: number): number => 1 - (1 - progress) * (1 - progress),
  };

  /**
   * Animate from a start value to an end value over a specified duration
   */
  animate(
    startValue: number,
    endValue: number,
    onUpdate: (value: number) => void,
    onComplete?: () => void,
    options: AnimationOptions = {}
  ): void {
    const {
      duration = 400,
      easing = AnimationService.easingFunctions.easeInOutCubic
    } = options;

    const startTime = performance.now();
    const delta = endValue - startValue;

    // Cancel any existing animation
    this.cancel();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easedValue = easing(progress);
      const currentValue = startValue + delta * easedValue;
      
      onUpdate(currentValue);
      
      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.animationFrame = null;
        onComplete?.();
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Cancel any ongoing animation
   */
  cancel(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Check if an animation is currently running
   */
  isAnimating(): boolean {
    return this.animationFrame !== null;
  }
}

// Export a singleton instance for convenience
export const animationService = new AnimationService();
