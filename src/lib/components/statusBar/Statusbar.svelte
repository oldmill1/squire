<script lang="ts">
  import styles from './Statusbar.module.scss';
  import { modeStore, type Mode } from '$lib/stores/modeStore';
  import { textStore } from '$lib/stores/textStore';
  import { saveNotificationStore } from '$lib/stores/saveNotificationStore';
  import { commandStore } from '$lib/stores/commandStore';
  
  interface Props {
    centerText?: string;
    rightText?: string;
  }
  
  let { centerText = 'Center Status', rightText = 'Right Status' }: Props = $props();
  
  const currentMode = $derived($modeStore);
  const currentLines = $derived($textStore);
  const saveNotification = $derived($saveNotificationStore);
  const currentCommand = $derived($commandStore);
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
  
  // Format display text for line and word count
  const displayCounts = $derived(
    lineCount === 0 && wordCount === 0 ? '' :
    lineCount > 0 && wordCount > 0 ? `${lineCount}(${wordCount})` :
    lineCount > 0 ? `${lineCount}` :
    `${wordCount}`
  );
  
  // Center text shows save notification or default center text
  const centerDisplay = $derived(saveNotification?.message || centerText);
  
  // Left section shows mode and command input when in command mode
  const leftDisplay = $derived(
    currentMode === 'command' ? `:${currentCommand}` : getModeDisplay(currentMode)
  );
  
  function getModeDisplay(mode: Mode): string {
    if (mode === 'normal') return '';
    if (mode === 'insert') return 'Insert';
    if (mode === 'command') return ':';
    return mode; // This line should never be reached with current Mode type
  }
</script>

<div class={styles.statusbar}>
  <div class={styles.left}>{leftDisplay}</div>
  <div class={styles.center}>{centerDisplay}</div>
  <div class={styles.right}>{displayCounts || rightText}</div>
</div>
