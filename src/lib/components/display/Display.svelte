<script lang="ts">
  import styles from './Display.module.scss';
  import { fontSizeStore } from '$lib/stores/fontSizeStore';
  import { textStore, getLines } from '$lib/stores/textStore';
  import { modeStore } from '$lib/stores/modeStore';
  import { currentLineStore } from '$lib/stores/currentLineStore';
  import { selectedLinesStore } from '$lib/stores/selectedLinesStore';
  import { onMount } from 'svelte';
  import Cursor from '../cursor/Cursor.svelte';
  
  const fontSize = $derived($fontSizeStore);
  const currentLines = $derived($textStore);
  const currentMode = $derived($modeStore);
  const currentLine = $derived($currentLineStore);
  const selectedLines = $derived($selectedLinesStore);
  let showSquire = $state(false);
  let fading = $state(false);
  let linesContainerRef = $state<HTMLElement>();
  let typewriterOffset = $state(0);
  let previousLineCount = $state(0);

  onMount(() => {
    // Show Squire after a brief delay to allow font loading
    setTimeout(() => {
      if (currentLines.length === 0 && currentMode === 'script') {
        showSquire = true;
      }
    }, 500);
  });

  function handleTypewriterEffect() {
    console.log('handleTypewriterEffect called', {
      currentMode,
      linesContainerRef: !!linesContainerRef,
      currentLinesLength: currentLines.length
    });
    
    if (currentMode === 'interactive' && linesContainerRef && currentLines.length >= 2) {
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        // Check if container is at least 200px tall before starting effect
        const containerHeight = linesContainerRef!.getBoundingClientRect().height;
        console.log('container height:', containerHeight);
        
        if (containerHeight < 200) {
          console.log('Container too small, waiting...');
          return;
        }
        
        // Use the correct CSS module class selector
        const lineElements = linesContainerRef!.querySelectorAll('span');
        console.log('lineElements found:', lineElements.length);
        console.log('linesContainer children:', linesContainerRef!.children.length);
        
        const secondToLastLine = lineElements[lineElements.length - 2];
        console.log('secondToLastLine:', !!secondToLastLine);
        
        if (secondToLastLine) {
          const height = secondToLastLine.getBoundingClientRect().height;
          console.log('height measured:', height);
          
          if (height > 0) {
            typewriterOffset += height;
            console.log('new typewriterOffset:', typewriterOffset);
          } else {
            console.log('height is 0, retrying...');
            // Retry with a longer delay if height is 0
            setTimeout(() => {
              const retryHeight = secondToLastLine.getBoundingClientRect().height;
              console.log('retry height measured:', retryHeight);
              if (retryHeight > 0) {
                typewriterOffset += retryHeight;
                console.log('retry new typewriterOffset:', typewriterOffset);
              }
            }, 100);
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
    // console.log('Line count effect:', {
    //   currentMode,
    //   currentLinesLength: currentLines.length,
    //   previousLineCount,
    //   shouldTrigger: currentMode === 'interactive' && currentLines.length > previousLineCount && previousLineCount > 0
    // });
    
    if (currentMode === 'interactive' && currentLines.length > previousLineCount && previousLineCount > 0) {
      // Use longer setTimeout to ensure DOM has updated with the new line
      setTimeout(handleTypewriterEffect, 50);
    }
    previousLineCount = currentLines.length;
  });

  $effect(() => {
    // Reset typewriter offset when switching modes or clearing text
    if (currentMode !== 'interactive' || currentLines.length === 0) {
      typewriterOffset = 0;
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
      <div class={styles.linesContainer} bind:this={linesContainerRef} style="transform: translateY(-{typewriterOffset}px);">
        {#each currentLines as line, index}
          {@const lineNum = index + 1}
          {@const isSelected = selectedLines.includes(lineNum)}
          {@const isCurrent = index === currentLine}
          {@const cleanLine = line.replace(/\s+$/, '')}
          <span 
            class={`${styles.line} ${isCurrent ? styles.currentLine : ''} ${isSelected ? styles.selectedLine : ''}`} 
            data-line={lineNum}
            data-selected={isSelected}
          >
            {cleanLine}
            {#if isCurrent}
              <Cursor />
            {/if}
          </span>
        {/each}
      </div>
    </div>
  {/if}
</div>
