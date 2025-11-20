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
