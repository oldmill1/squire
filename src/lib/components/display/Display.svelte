<script lang="ts">
  import styles from './Display.module.scss';
  import { fontSizeStore } from '$lib/stores/fontSizeStore';
  import { textStore, getLines } from '$lib/stores/textStore';
  import { modeStore } from '$lib/stores/modeStore';
  import { currentLineStore } from '$lib/stores/currentLineStore';
  import { selectedLinesStore } from '$lib/stores/selectedLinesStore';
  import { onMount } from 'svelte';
  
  const fontSize = $derived($fontSizeStore);
  const currentLines = $derived($textStore);
  const currentMode = $derived($modeStore);
  const currentLine = $derived($currentLineStore);
  const selectedLines = $derived($selectedLinesStore);
  let showSquire = $state(false);
  let fading = $state(false);

  onMount(() => {
    // Show Squire after a brief delay to allow font loading
    setTimeout(() => {
      if (currentLines.length === 0 && currentMode === 'script') {
        showSquire = true;
      }
    }, 500);
  });

  $effect(() => {
    if (currentMode === 'interactive' && showSquire) {
      // Start fading when entering interactive mode
      fading = true;
      // Hide completely after animation
      setTimeout(() => {
        showSquire = false;
      }, 300);
    } else if (currentMode === 'script' && currentLines.length === 0 && !showSquire && !fading) {
      // Show again when in script mode and text is cleared
      showSquire = true;
      fading = false;
    }
  });

  $effect(() => {
    // Update current line to be the last line (or 0 if no lines)
    currentLineStore.set(currentLines.length > 0 ? currentLines.length - 1 : 0);
  });

  $effect(() => {
    // Debug: Log when selectedLines changes
    console.log('Display: selectedLines changed:', selectedLines);
  });
</script>

<div class={styles.display} style="font-size: {fontSize}rem;">
  {#if showSquire}
    <div class={`${styles.emptyState} ${fading ? styles.fading : ''}`}>Squire</div>
  {:else}
    <div class={styles.contentWrapper}>
      <div class={styles.linesContainer}>
        {#each currentLines as line, index}
          {@const lineNum = index + 1}
          {@const isSelected = selectedLines.includes(lineNum)}
          {@const isCurrent = index === currentLine}
          <span 
            class={`${styles.line} ${isCurrent ? styles.currentLine : ''} ${isSelected ? styles.selectedLine : ''}`} 
            data-line={lineNum}
            data-selected={isSelected}
          >{line}</span>
        {/each}
      </div>
    </div>
  {/if}
</div>
