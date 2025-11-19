<script lang="ts">
  import styles from './Display.module.scss';
  import { fontSizeStore } from '$lib/stores/fontSizeStore';
  import { textStore, getLines } from '$lib/stores/textStore';
  import { modeStore } from '$lib/stores/modeStore';
  import { currentLineStore } from '$lib/stores/currentLineStore';
  import { selectedLinesStore } from '$lib/stores/selectedLinesStore';
  import { onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
  import Cursor from '../cursor/Cursor.svelte';
  
  const fontSize = $derived($fontSizeStore);
  const currentLines = $derived($textStore);
  const currentMode = $derived($modeStore);
  const currentLine = $derived($currentLineStore);
  const selectedLines = $derived($selectedLinesStore);
  let showSquire = $state(false);
  let fading = $state(false);
  let linesContainerRef = $state<HTMLElement>();
  let previousLineCount = $state(0);
  
  const typewriterOffset = tweened(0, {
    duration: 400,
    easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  });

  onMount(() => {
    // Show Squire after a brief delay to allow font loading
    setTimeout(() => {
      if (currentLines.length === 0 && currentMode === 'script') {
        showSquire = true;
      }
    }, 500);
  });

  function handleTypewriterEffect() {
    if (currentMode === 'interactive' && linesContainerRef && currentLines.length >= 2) {
      requestAnimationFrame(() => {
        const containerHeight = linesContainerRef!.getBoundingClientRect().height;
        
        if (containerHeight < 200) {
          return;
        }
        
        const lineElements = linesContainerRef!.querySelectorAll('span');
        const secondToLastLine = lineElements[lineElements.length - 2];
        
        if (secondToLastLine) {
          const height = secondToLastLine.getBoundingClientRect().height;
          
          if (height > 0) {
            const currentOffset = $typewriterOffset;
            typewriterOffset.set(currentOffset + height);
          }
        }
      });
    }
  }

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
    // Trigger typewriter effect when a new line is added in interactive mode
    if (currentMode === 'interactive' && currentLines.length > previousLineCount && previousLineCount > 0) {
      // Use requestAnimationFrame immediately for smoother response
      requestAnimationFrame(handleTypewriterEffect);
    }
    previousLineCount = currentLines.length;
  });

  $effect(() => {
    // Reset typewriter offset when switching modes or clearing text
    if (currentMode !== 'interactive' || currentLines.length === 0) {
      typewriterOffset.set(0);
    }
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
      <div class={styles.linesContainer} bind:this={linesContainerRef} style="transform: translateY(-{$typewriterOffset}px);">
        {#each currentLines as line, index}
          {@const lineNum = index + 1}
          {@const isSelected = selectedLines.includes(lineNum)}
          {@const isCurrent = index === currentLine}
          {@const cleanLine = line}
          <span 
            class={`${styles.line} ${isCurrent ? styles.currentLine : ''} ${isSelected ? styles.selectedLine : ''}`} 
            data-line={lineNum}
            data-selected={isSelected}
          >
            <span class={styles.lineContent}>
              {cleanLine}
              {#if isCurrent}
                <Cursor isEmptyLine={cleanLine.length === 0} />
              {/if}
            </span>
          </span>
        {/each}
      </div>
    </div>
  {/if}
</div>
