<script lang="ts">
  import styles from './Statusbar.module.scss';
  import { modeStore, type Mode } from '$lib/stores/modeStore';
  import { textStore } from '$lib/stores/textStore';
  
  interface Props {
    centerText?: string;
    rightText?: string;
  }
  
  let { centerText = 'Center Status', rightText = 'Right Status' }: Props = $props();
  
  const currentMode = $derived($modeStore);
  const currentLines = $derived($textStore);
  const lineCount = $derived(currentLines.length);
  
  // Calculate total word count across all lines
  const wordCount = $derived(
    currentLines.length === 0 ? 0 : currentLines.reduce((total, line) => {
      // Split by whitespace and filter out empty strings
      const words = line.trim().split(/\s+/).filter(word => word.length > 0);
      return total + words.length;
    }, 0)
  );
  
  // Format display text for line and word count
  const displayLineCount = $derived(lineCount > 0 ? `${lineCount} lines` : '');
  const displayWordCount = $derived(wordCount > 0 ? `${wordCount} words` : '');
  const displayCounts = $derived([displayLineCount, displayWordCount].filter(Boolean).join(' • '));
  
  function getModeDisplay(mode: Mode): string {
    if (mode === 'script') return 'Script Mode';
    if (mode === 'interactive') return 'Interactive Mode';
    return mode; // This line should never be reached with current Mode type
  }
</script>

<div class={styles.statusbar}>
  <div class={styles.left}>{getModeDisplay(currentMode)}</div>
  <div class={styles.center}>{centerText}</div>
  <div class={styles.right}>{displayCounts || rightText}</div>
</div>
