<script lang="ts">
  import styles from './ScrollBar.module.scss';
  import { updateSliderValue } from '$lib/stores/debugStore';
  
  interface Props {
    minValue?: number;
    maxValue?: number;
    currentValue?: number;
    onScroll?: (position: number) => void;
  }
  
  let { minValue = 0, maxValue = 100, currentValue = 0, onScroll }: Props = $props();
  
  let isDragging = $state(false);
  let barElement: HTMLElement;
  let headElement: HTMLElement;
  let dragOffset = $state(0);
  let animatedPosition = $state(0);
  
  // Scroll velocity tracking
  let scrollVelocity = $state(0);
  let lastScrollTime = $state(0);
  let scrollHistory: Array<{ time: number; delta: number }> = [];
  let velocityAnimationFrame: number;
  
  // Smooth animation using requestAnimationFrame
  let animationFrame: number;
  
  function animateToPosition(targetPosition: number) {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    
    const startPosition = animatedPosition;
    const distance = targetPosition - startPosition;
    const duration = 150; // ms
    const startTime = performance.now();
    
    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      animatedPosition = startPosition + (distance * easeOut);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    }
    
    animationFrame = requestAnimationFrame(animate);
  }
  
  function handleMouseDown(event: MouseEvent) {
    if (!headElement || !barElement) return;
    
    const headRect = headElement.getBoundingClientRect();
    const barRect = barElement.getBoundingClientRect();
    
    // Calculate offset from center of head to mouse position
    dragOffset = event.clientY - (headRect.top + headRect.height / 2);
    
    isDragging = true;
    event.preventDefault();
  }
  
  function handleMouseMove(event: MouseEvent) {
    if (!isDragging || !barElement) return;
    
    const rect = barElement.getBoundingClientRect();
    const relativeY = event.clientY - rect.top - dragOffset;
    const percentage = Math.max(0, Math.min(1, relativeY / rect.height));
    
    // Update position immediately during drag for responsiveness
    animatedPosition = percentage;
    
    // Calculate actual value from percentage and update debug store
    const actualValue = minValue + (percentage * (maxValue - minValue));
    updateSliderValue(actualValue);
    
    onScroll?.(percentage);
  }
  
  function handleMouseUp() {
    isDragging = false;
    dragOffset = 0;
  }
  
  // Track scroll velocity from wheel/touch events
  function handleWheelScroll(event: WheelEvent) {
    event.preventDefault(); // Prevent native scroll
    
    const currentTime = performance.now();
    const delta = event.deltaY;
    
    // Track scroll history for velocity calculation
    scrollHistory.push({ time: currentTime, delta });
    
    // Keep only recent history (last 100ms)
    scrollHistory = scrollHistory.filter(item => currentTime - item.time < 100);
    
    // Calculate velocity based on recent scroll history
    if (scrollHistory.length > 1) {
      const recentScrolls = scrollHistory.slice(-5); // Last 5 events
      const totalDelta = recentScrolls.reduce((sum, item) => sum + item.delta, 0);
      const timeSpan = recentScrolls[recentScrolls.length - 1].time - recentScrolls[0].time;
      
      if (timeSpan > 0) {
        scrollVelocity = (totalDelta / timeSpan) * 3; // Reduced from 10 to 3 for less sensitivity
      }
    }
    
    // Apply immediate scroll based on wheel delta (reduced sensitivity)
    const scrollDelta = (delta / 3000) * -1; // Changed from 1000 to 3000 for less sensitivity
    const newPosition = Math.max(0, Math.min(1, animatedPosition + scrollDelta));
    
    animatedPosition = newPosition;
    
    // Calculate actual value and update
    const actualValue = minValue + (newPosition * (maxValue - minValue));
    updateSliderValue(actualValue);
    
    onScroll?.(newPosition);
    
    // Apply momentum scrolling
    applyMomentumScroll();
  }
  
  // Apply momentum based on calculated velocity
  function applyMomentumScroll() {
    if (velocityAnimationFrame) {
      cancelAnimationFrame(velocityAnimationFrame);
    }
    
    let velocity = scrollVelocity;
    const friction = 0.92; // Increased friction for faster deceleration (was 0.95)
    const minVelocity = 0.005; // Lower threshold for stopping earlier (was 0.01)
    
    function momentumStep() {
      if (Math.abs(velocity) < minVelocity) {
        return;
      }
      
      // Apply velocity to position (reduced sensitivity)
      const delta = velocity * 0.005; // Reduced from 0.01 for less sensitivity
      const newPosition = Math.max(0, Math.min(1, animatedPosition + delta));
      
      animatedPosition = newPosition;
      
      // Calculate actual value and update
      const actualValue = minValue + (newPosition * (maxValue - minValue));
      updateSliderValue(actualValue);
      
      onScroll?.(newPosition);
      
      // Apply friction
      velocity *= friction;
      
      // Continue momentum
      velocityAnimationFrame = requestAnimationFrame(momentumStep);
    }
    
    velocityAnimationFrame = requestAnimationFrame(momentumStep);
  }
  
  $effect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  });
  
  // Listen for wheel events to capture scroll momentum
  $effect(() => {
    const handleWheel = (event: WheelEvent) => handleWheelScroll(event);
    
    // Add wheel listener to the window or a specific scrollable container
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (velocityAnimationFrame) {
        cancelAnimationFrame(velocityAnimationFrame);
      }
    };
  });
  
  // Calculate scroll position as percentage (0-1) from current value
  let scrollPosition = $derived(maxValue > minValue ? (currentValue - minValue) / (maxValue - minValue) : 0);
  
  // Animate to new position when currentValue changes externally
  $effect(() => {
    if (!isDragging) {
      const targetPosition = maxValue > minValue ? (currentValue - minValue) / (maxValue - minValue) : 0;
      animateToPosition(targetPosition);
    }
  });
  
  // Cleanup animation frame on unmount
  $effect(() => {
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  });
</script>

<div class={styles.scrollbar} bind:this={barElement}>
  <div 
    class={styles.head} 
    bind:this={headElement}
    style={`top: ${animatedPosition * 100}%`}
    onmousedown={handleMouseDown}
    role="slider"
    tabindex="0"
    aria-label="Scroll position"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow={Math.round(scrollPosition * 100)}
  ></div>
</div>
