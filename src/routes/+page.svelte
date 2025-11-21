<script lang="ts">
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import styles from './+page.module.scss';
  import SplashIcon from '$lib/components/splash/SplashIcon.svelte';
  import BackgroundShapes from '$lib/components/splash/BackgroundShapes.svelte';
  import { documentService } from '$lib/services/documentService';

  let mounted = $state(false);
  
  onMount(() => {
    // Wait for client-side hydration before showing animations
    mounted = true;
  });

  async function createNewDraft() {
    try {
      const newDoc = await documentService.createNewDocument();
      // Remove "doc:" prefix for cleaner URL
      const slug = newDoc._id.replace('doc:', '');
      goto(`/draft/${slug}`);
    } catch (error) {
      console.error('Failed to create new draft:', error);
    }
  }
</script>

<div class={styles.splashContainer}>
  <BackgroundShapes />
  
  <div class={styles.splashContent}>
    <SplashIcon {mounted} />
    
    {#if mounted}
      <h1 class={styles.appTitle} transition:fly={{ y: 20, duration: 600, delay: 200 }}><span class={styles.titleScript}>Squire</span></h1>
      <p class={styles.appSubtitle} transition:fly={{ y: 20, duration: 600, delay: 400 }}><span class={styles.futuraText}>FinalDraft</span> meets <span class={styles.codeText}>vim</span></p>
      
      <div class={styles.actionButtons}>
        <button class={styles.primaryButton} transition:fly={{ y: 20, duration: 600, delay: 600 }} onclick={createNewDraft}>
          New Draft
        </button>
        <button class={styles.secondaryButton} transition:fly={{ y: 20, duration: 600, delay: 700 }} onclick={() => console.log('Open drafts')}>
          Open Drafts
        </button>
        <button class={styles.textButton} transition:fly={{ y: 20, duration: 600, delay: 800 }} onclick={() => console.log('About')}>
          How to Use Squire
        </button>
      </div>
    {/if}
  </div>
</div>
