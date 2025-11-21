<script lang="ts">
  import { animationService } from '$lib/services/animationService';
  import { currentLineStore } from '$lib/stores/currentLineStore';
  import { cursorStore } from '$lib/stores/cursorStore';
  import { debugStore, resetDebugStore, updateLineContainerHeight, updateLineCount, updateLineHeightIncrement, updateTransformValue } from '$lib/stores/debugStore';
  import { fontSizeStore } from '$lib/stores/fontSizeStore';
  import { lineNumberVisibilityStore } from '$lib/stores/lineNumberStore';
  import { modeStore } from '$lib/stores/modeStore';
  import { selectedLinesStore } from '$lib/stores/selectedLinesStore';
  import { textStore } from '$lib/stores/textStore';
  import { loadTransformFromLocalStorage, resetTransform, updateTransform } from '$lib/stores/transformStore';
  import { getNormalizedSelection, visualStore } from '$lib/stores/visualStore';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import Cursor from '../cursor/Cursor.svelte';
  import styles from './Display.module.scss';
  
  const fontSize = $derived($fontSizeStore);
  const currentLines = $derived($textStore);
  const currentMode = $derived($modeStore);
  const currentLine = $derived($currentLineStore);
  const selectedLines = $derived($selectedLinesStore);
  const debugInfo = $derived($debugStore);
  const cursorPosition = $derived($cursorStore);
  const visualState = $derived($visualStore);
  const showLineNumbers = $derived($lineNumberVisibilityStore);
  let showSquire = $state(false);
  let fading = $state(false);
  let contentVisible = $state(false);
  let linesContainerRef = $state<HTMLElement>();
  let typewriterOffsetValue = $state(0);
  let targetOffset = $state(0);
  let previousLineCount = $state(0);
  let previousMode = $state('normal');
  let previousTextLength = $state(0);
  
  onMount(() => {
    // Load saved transform from localStorage first
    const savedTransform = loadTransformFromLocalStorage();
    if (savedTransform !== 0) {
      targetOffset = savedTransform;
      typewriterOffsetValue = savedTransform;
    }
    
    // Show Squire after a brief delay to allow font loading
    setTimeout(() => {
      if (currentLines.length === 0 && currentMode === 'normal') {
        showSquire = true;
      }
    }, 500);
    
    // Fade in content after transform is applied to prevent flash
    setTimeout(() => {
      contentVisible = true;
    }, 100);
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
    console.log('=== Typewriter Effect Started ===');
    console.log('currentLines.length:', currentLines.length);
    
    if (linesContainerRef && currentLines.length >= 2) {
      requestAnimationFrame(() => {
        const containerHeight = linesContainerRef!.getBoundingClientRect().height;
        console.log('containerHeight:', containerHeight);
        
        if (containerHeight < 200) {
          console.log('Container height too small, returning');
          return;
        }
        
        const lineElements = linesContainerRef!.querySelectorAll('span');
        console.log('lineElements.length:', lineElements.length);
        
        // Find the last non-empty line element
        let lastNonEmptyLine = null;
        for (let i = lineElements.length - 1; i >= 0; i--) {
          const line = lineElements[i];
          const textContent = line.textContent?.trim();
          if (textContent && textContent.length > 0) {
            lastNonEmptyLine = line;
            break;
          }
        }
        
        console.log('lastNonEmptyLine element:', lastNonEmptyLine);
        
        if (lastNonEmptyLine) {
          const height = lastNonEmptyLine.getBoundingClientRect().height;
          console.log('lastNonEmptyLine height:', height);
          console.log('lastNonEmptyLine element content:', lastNonEmptyLine.textContent);
          
          // Add artificial value to height calculation
          const artificialOffset = 1; // You can adjust this value
          const adjustedHeight = height + artificialOffset;
          console.log('adjustedHeight:', adjustedHeight);
          
          // Debug: Add red border to last line
          // (lastLine as HTMLElement).style.border = '2px solid red';
          
          if (height > 0) {
            console.log('Updating line height increment to:', adjustedHeight);
            updateLineHeightIncrement(adjustedHeight);
            targetOffset += adjustedHeight;
            console.log('New targetOffset:', targetOffset);
            animateToTarget();
          } else {
            console.log('Height is 0, not updating');
          }
        } else {
          console.log('No lastLine element found');
        }
      });
    } else {
      console.log('Conditions not met - linesContainerRef:', !!linesContainerRef, 'lines >= 2:', currentLines.length >= 2);
    }
  }

  $effect(() => {
    if (currentMode === 'insert' && showSquire) {
      // Start fading when entering insert mode
      fading = true;
      // Hide completely after animation
      setTimeout(() => {
        showSquire = false;
      }, 300);
    } else if (currentMode === 'normal' && currentLines.length === 0 && !showSquire && !fading) {
      // Show again when in normal mode and text is cleared
      showSquire = true;
      fading = false;
    }
  });

  $effect(() => {
    // This effect has been removed since currentLineStore is now properly managed
    // by the textStore functions (appendText, insertNewline, deleteCharacter)
    // to maintain cursor position synchronization
    previousTextLength = currentLines.length;
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
      resetTransform();
      contentVisible = false;
    } else {
      // When new content is added after a clear, ensure it becomes visible again
      contentVisible = true;
    }
  });

  $effect(() => {
    // Debug: Log when selectedLines changes
    // console.log('Display: selectedLines changed:', selectedLines);
  });

  $effect(() => {
    // Update debug store with transform value changes
    updateTransformValue(typewriterOffsetValue);
    // Save transform to localStorage
    updateTransform(typewriterOffsetValue);
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
        if (!linesContainerRef) return;
        const height = linesContainerRef.getBoundingClientRect().height;
        const lineElements = linesContainerRef.querySelectorAll('span');
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

  // Helper functions for visual selection
  function getSelectionForLine(lineIndex: number): { start: number; end: number } | null {
    if (!visualState.active || visualState.type !== 'char') {
      return null;
    }

    const normalized = getNormalizedSelection();
    if (!normalized) return null;

    const { start, end } = normalized;
    
    // If line is outside selection range
    if (lineIndex < start.line || lineIndex > end.line) {
      return null;
    }

    // Single line selection
    if (start.line === end.line) {
      return { start: start.col, end: end.col };
    }

    // Multi-line selection
    if (lineIndex === start.line) {
      return { start: start.col, end: currentLines[lineIndex]?.length || 0 };
    } else if (lineIndex === end.line) {
      return { start: 0, end: end.col };
    } else {
      // Middle line - select entire line
      return { start: 0, end: currentLines[lineIndex]?.length || 0 };
    }
  }

  function renderLineWithSelection(line: string, lineIndex: number): string {
    const selection = getSelectionForLine(lineIndex);
    if (!selection) return line;

    const { start, end } = selection;
    const before = line.slice(0, start);
    const selected = line.slice(start, end);
    const after = line.slice(end);

    return `${before}<span class="${styles.visualSelection}">${selected}</span>${after}`;
  }
</script>

<div class={styles.display} style="font-size: {fontSize}rem;">
  {#if showSquire}
    <div class={`${styles.emptyState} ${fading ? styles.fading : ''}`}>Squire</div>
  {:else}
    <div class={`${styles.contentWrapper} ${contentVisible ? styles.visible : styles.hidden}`}>
      <div class={styles.linesContainer} bind:this={linesContainerRef} style="transform: translateY(-{typewriterOffsetValue}px);">
        {#each currentLines as line, index}
          {@const lineNum = index + 1}
          {@const isSelected = selectedLines.includes(lineNum)}
          {@const isCurrent = index === currentLine}
          {@const cleanLine = line}
          {@const hasSelection = visualState.active && visualState.type === 'char' && getSelectionForLine(index) !== null}
          <span 
            class={`${styles.line} ${isCurrent ? styles.currentLine : ''} ${isSelected ? styles.selectedLine : ''} ${hasSelection ? styles.hasVisualSelection : ''}`} 
            data-line={lineNum}
            data-selected={isSelected}
          >
            <div class={styles.lineNumber}>
              {#if showLineNumbers}
                <div transition:fade={{ duration: 300 }}>
                  {lineNum}
                </div>
              {/if}
            </div>
            <div class={styles.lineContent}>
              {#if isCurrent && !hasSelection}
                {@const beforeCursor = cleanLine.slice(0, cursorPosition.col)}
                {@const afterCursor = cleanLine.slice(cursorPosition.col)}
                <div class={styles.rawText}>{beforeCursor}</div>
                <Cursor isEmptyLine={cleanLine.length === 0} />
                <div class={styles.rawText}>{afterCursor}</div>
              {:else if hasSelection}
                {@const selection = getSelectionForLine(index)}
                {@const beforeSelection = cleanLine.slice(0, selection!.start)}
                {@const selectedText = cleanLine.slice(selection!.start, selection!.end)}
                {@const afterSelection = cleanLine.slice(selection!.end)}
                
                <!-- Check if cursor should be shown at selection end on this line -->
                {@const showCursorAtEnd = isCurrent && visualState.active && visualState.end && visualState.end!.line === index}
                {@const cursorPos = showCursorAtEnd ? visualState.end!.col : -1}
                
                <!-- Render before selection -->
                <div class={styles.rawText}>{beforeSelection}</div>
                
                <!-- Render selected text with cursor if needed -->
                {#if showCursorAtEnd && cursorPos >= selection!.start && cursorPos <= selection!.end}
                  <!-- Cursor is inside the selection -->
                  {@const beforeCursorInSelection = selectedText.slice(0, cursorPos - selection!.start)}
                  {@const afterCursorInSelection = selectedText.slice(cursorPos - selection!.start)}
                  <span class={styles.visualSelection}>{beforeCursorInSelection}</span>
                  <Cursor isEmptyLine={false} />
                  <span class={styles.visualSelection}>{afterCursorInSelection}</span>
                {:else}
                  <!-- No cursor in selection on this line -->
                  <span class={styles.visualSelection}>{selectedText}</span>
                {/if}
                
                <!-- Render after selection -->
                <div class={styles.rawText}>{afterSelection}</div>
              {:else}
                <div class={styles.rawText}>{cleanLine}</div>
              {/if}
            </div>
          </span>
        {/each}
      </div>
    </div>
  {/if}
</div>
