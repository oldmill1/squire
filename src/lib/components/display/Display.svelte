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
  import { animationService } from '$lib/services/animationService';
  import { debugStore, updateTransformValue, updateSliderValue, resetDebugStore, updateLineContainerHeight, updateLineCount } from '$lib/stores/debugStore';
  
  const fontSize = $derived($fontSizeStore);
  const currentLines = $derived($textStore);
  const currentMode = $derived($modeStore);
  const currentLine = $derived($currentLineStore);
  const selectedLines = $derived($selectedLinesStore);
  const debugInfo = $derived($debugStore);
  let showSquire = $state(false);
  let fading = $state(false);
  let linesContainerRef = $state<HTMLElement>();
  let typewriterOffsetValue = $state(0);
  let targetOffset = $state(0);
  let previousLineCount = $state(0);
  
  onMount(() => {
    // Show Squire after a brief delay to allow font loading
    setTimeout(() => {
      if (currentLines.length === 0 && currentMode === 'script') {
        showSquire = true;
      }
    }, 500);
  });

  function animateToTarget() {
    animationService.animate(
      typewriterOffsetValue,
      targetOffset,
      (value) => {
        typewriterOffsetValue = value;
      }
    );
  }

  function handleTypewriterEffect() {
    if (linesContainerRef && currentLines.length >= 2) {
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
            targetOffset += height;
            animateToTarget();
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
    // Trigger typewriter effect when a new line is added
    if (currentLines.length > previousLineCount && previousLineCount > 0) {
      // Use requestAnimationFrame immediately for smoother response
      requestAnimationFrame(handleTypewriterEffect);
    }
    previousLineCount = currentLines.length;
  });

  $effect(() => {
    // Reset typewriter offset when clearing text
    if (currentLines.length === 0) {
      targetOffset = 0;
      typewriterOffsetValue = 0;
      animationService.cancel();
      resetDebugStore();
    }
  });

  $effect(() => {
    // Debug: Log when selectedLines changes
    // console.log('Display: selectedLines changed:', selectedLines);
  });

  $effect(() => {
    // Update debug store with transform value changes
    updateTransformValue(typewriterOffsetValue);
  });

  $effect(() => {
    // Sync slider changes back to transform value (when user moves slider)
    if (debugInfo.sliderValue !== typewriterOffsetValue) {
      animationService.cancel();
      typewriterOffsetValue = debugInfo.sliderValue;
      targetOffset = debugInfo.sliderValue;
    }
  });

  $effect(() => {
    // Update debug info with line container height and line count
    // This effect runs when: container exists, transform changes, or line count changes
    linesContainerRef;
    typewriterOffsetValue;
    currentLines.length;
    
    if (linesContainerRef) {
      const updateDebugInfo = () => {
        const height = linesContainerRef!.getBoundingClientRect().height;
        const lineElements = linesContainerRef!.querySelectorAll('span');
        const actualLineCount = lineElements.length;
        
        // Update height and line count
        updateLineContainerHeight(height);
        setTimeout(() => {
          updateLineCount(actualLineCount);
        }, 100);
      };
      
      // Update immediately and also after a brief delay to catch any layout changes
      requestAnimationFrame(updateDebugInfo);
      setTimeout(updateDebugInfo, 50);
    }
  });
</script>

<div class={styles.display} style="font-size: {fontSize}rem;">
  {#if showSquire}
    <div class={`${styles.emptyState} ${fading ? styles.fading : ''}`}>Squire</div>
  {:else}
    <div class={styles.contentWrapper}>
      <div class={styles.linesContainer} bind:this={linesContainerRef} style="transform: translateY(-{typewriterOffsetValue}px);">
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
