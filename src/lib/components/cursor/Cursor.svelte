<script lang="ts">
  import styles from './Cursor.module.scss';
  import { onMount } from 'svelte';

  let { isEmptyLine = false } = $props();
  let isVisible = $state(true);

  // Blink cursor animation
  onMount(() => {
    const interval = setInterval(() => {
      isVisible = !isVisible;
    }, 530); // Apple-like timing
    
    return () => clearInterval(interval);
  });
</script>

<div 
  class={`${styles.cursor} ${isEmptyLine ? styles.emptyLine : ''}`}
  style="opacity: {isVisible ? '1' : '0'};"
>
  <div class={styles.cursorInner}></div>
</div>
