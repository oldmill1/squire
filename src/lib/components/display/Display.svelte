<script lang="ts">
  import styles from './Display.module.scss';
  import { fontSizeStore } from '$lib/stores/fontSizeStore';
  import { textStore } from '$lib/stores/textStore';
  import { modeStore } from '$lib/stores/modeStore';
  import Cursor from '../cursor/Cursor.svelte';
  import { onMount } from 'svelte';
  
  const fontSize = $derived($fontSizeStore);
  const currentText = $derived($textStore);
  const currentMode = $derived($modeStore);
  let showSquire = $state(false);
  let fading = $state(false);
  let textElement = $state<HTMLElement | undefined>();

  onMount(() => {
    // Show Squire after a brief delay to allow font loading
    setTimeout(() => {
      if (currentText.trim() === '' && currentMode === 'script') {
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
    } else if (currentMode === 'script' && currentText.trim() === '' && !showSquire && !fading) {
      // Show again when in script mode and text is cleared
      showSquire = true;
      fading = false;
    }
  });
</script>

<div class={styles.display} style="font-size: {fontSize}rem;">
  {#if showSquire}
    <div class={`${styles.emptyState} ${fading ? styles.fading : ''}`}>Squire</div>
  {:else}
    <div bind:this={textElement} class={styles.textContent}>
      {currentText}
      {#if currentMode === 'interactive'}
        <Cursor {textElement} />
      {/if}
    </div>
  {/if}
</div>
