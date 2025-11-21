<script lang="ts">
  import styles from './Statusbar.module.scss';
  import ModeStatus from './ModeStatus.svelte';
  import { textStore } from '$lib/stores/textStore';
  import { saveNotificationStore } from '$lib/stores/saveNotificationStore';
  import { cursorStore } from '$lib/stores/cursorStore';
  import { tweened } from 'svelte/motion';
  
  interface Props {
    centerText?: string;
    rightText?: string;
    progress?: number; // 0-100 for progress bar mode
  }
  
  let { centerText = 'Center Status', rightText = 'Right Status', progress = undefined }: Props = $props();
  
  // Use tweened for smooth progress animation
  const animatedProgress = tweened(0, { duration: 300, easing: (t) => t });
  
  // Update animated progress when progress prop changes
  $effect(() => {
    if (progress !== undefined) {
      animatedProgress.set(progress);
    } else {
      animatedProgress.set(0);
    }
  });
  
  const currentLines = $derived($textStore);
  const saveNotification = $derived($saveNotificationStore);
  const cursorPosition = $derived($cursorStore);
  const lineCount = $derived(currentLines.length);
  
  // Calculate total word count across all lines
  const wordCount = $derived(
    currentLines.length === 0 ? 0 : currentLines.reduce((total, line) => {
      // Skip null/undefined lines
      if (!line || typeof line !== 'string') return total;
      // Split by whitespace and filter out empty strings
      const words = line.trim().split(/\s+/).filter(word => word.length > 0);
      return total + words.length;
    }, 0)
  );
  
  // Format display text for cursor position, line and word count
  const displayCounts = $derived(
    (() => {
      const cursorPos = `(${cursorPosition.col + 1},${cursorPosition.line + 1})`; // 1-based for display
      
      if (lineCount === 0 && wordCount === 0) {
        return cursorPos;
      }
      
      let countsText = '';
      if (lineCount > 0 && wordCount > 0) {
        countsText = `${lineCount}l ${wordCount}w`;
      } else if (lineCount > 0) {
        countsText = `${lineCount}l`;
      } else {
        countsText = `${wordCount}w`;
      }
      
      return `${cursorPos} ${countsText}`;
    })()
  );
  
  // Center text shows save notification or default center text
  const centerDisplay = $derived(saveNotification?.message || centerText);
</script>

<div class={styles.statusbar}>
  {#if progress !== undefined}
    <!-- Progress bar mode -->
    <div class={styles.progressContainer}>
      <div class={styles.progressBar} style="width: {$animatedProgress}%"></div>
      <div class={styles.progressText}>{centerDisplay}</div>
    </div>
  {:else}
    <!-- Normal mode -->
    <ModeStatus />
    <div class={styles.center}>{centerDisplay}</div>
    <div class={styles.right}>{displayCounts || rightText}</div>
  {/if}
</div>
