<script lang="ts">
  import styles from './Cursor.module.scss';
  import { textStore } from '$lib/stores/textStore';
  import { onMount } from 'svelte';

  const { textElement }: { textElement: HTMLElement | undefined } = $props();
  const currentText = $derived($textStore);
  let cursorStyle = $derived('');

  onMount(() => {
    // Update cursor position when text changes
    $effect(() => {
      if (textElement) {
        updateCursorPosition();
      }
    });
  });

  function updateCursorPosition() {
    if (!textElement) return;

    // Create a temporary span to measure text width
    const measureSpan = document.createElement('span');
    measureSpan.style.visibility = 'hidden';
    measureSpan.style.position = 'absolute';
    measureSpan.style.whiteSpace = 'pre';
    measureSpan.textContent = currentText;
    
    // Copy font styles from the text element
    const computedStyle = window.getComputedStyle(textElement);
    measureSpan.style.fontSize = computedStyle.fontSize;
    measureSpan.style.fontFamily = computedStyle.fontFamily;
    measureSpan.style.fontWeight = computedStyle.fontWeight;
    measureSpan.style.letterSpacing = computedStyle.letterSpacing;
    
    document.body.appendChild(measureSpan);
    const width = measureSpan.offsetWidth;
    document.body.removeChild(measureSpan);

    // Position cursor at the end of text
    cursorStyle = `transform: translateX(${width}px);`;
  }
</script>

<div class={styles.cursor} style={cursorStyle}></div>
