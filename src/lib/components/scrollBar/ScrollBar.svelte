<script lang="ts">
  import styles from './ScrollBar.module.scss';
  
  interface Props {
    scrollPosition?: number; // 0-1 percentage
    onScroll?: (position: number) => void;
  }
  
  let { scrollPosition = 0, onScroll }: Props = $props();
  
  let isDragging = $state(false);
  let barElement: HTMLElement;
  let headElement: HTMLElement;
  
  function handleMouseDown(event: MouseEvent) {
    isDragging = true;
    event.preventDefault();
  }
  
  function handleMouseMove(event: MouseEvent) {
    if (!isDragging || !barElement) return;
    
    const rect = barElement.getBoundingClientRect();
    const relativeY = event.clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, relativeY / rect.height));
    
    onScroll?.(percentage);
  }
  
  function handleMouseUp() {
    isDragging = false;
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
  
  // Calculate head position based on scroll percentage
  let headPosition = $derived(scrollPosition);
</script>

<div class={styles.scrollbar} bind:this={barElement}>
  <div 
    class={styles.head} 
    bind:this={headElement}
    style={`top: ${headPosition * 100}%`}
    onmousedown={handleMouseDown}
    role="slider"
    aria-label="Scroll position"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow={Math.round(headPosition * 100)}
  ></div>
</div>
