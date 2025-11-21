<script lang="ts">
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import styles from './+page.module.scss';
  import BackgroundShapes from '$lib/components/splash/BackgroundShapes.svelte';
  import { documentService } from '$lib/services/documentService';

  let mounted = $state(false);
  let isCreating = $state(false);
  
  onMount(() => {
    // Wait for client-side hydration before showing animations
    mounted = true;
  });

  async function createNewDraft() {
    isCreating = true;
    try {
      const newDoc = await documentService.createNewDocument();
      // Remove "doc:" prefix for cleaner URL
      const slug = newDoc._id.replace('doc:', '');
      
      // Wait a bit longer to ensure document is fully saved in PouchDB
      setTimeout(() => {
        goto(`/draft/${slug}`);
      }, 500);
    } catch (error) {
      console.error('Failed to create new draft:', error);
      isCreating = false;
    }
  }
</script>

<div class={styles.splashContainer}>
  <BackgroundShapes />
  
  <div class={styles.splashContent}>
    {#if mounted}
      <h1 class={styles.appTitle} transition:fly={{ y: 20, duration: 600, delay: 200 }}><span class={styles.titleScript}>Squire</span></h1>
      
      <div style="margin-bottom: 60px;"></div>
      
      <p class={styles.appSubtitle} transition:fly={{ y: 20, duration: 600, delay: 400 }}><span class={styles.futuraText}>FinalDraft</span> meets <span class={styles.codeText}>vim</span></p>
      
      <div class={styles.actionButtons}>
        <button class={`${styles.primaryButton} ${isCreating ? styles.loading : ''}`} transition:fly={{ y: 20, duration: 600, delay: 600 }} onclick={createNewDraft} disabled={isCreating}>
          {#if isCreating}
            <span class={styles.spinner}></span>
            Creating...
          {:else}
            New Draft
          {/if}
        </button>
        <button class={styles.secondaryButton} transition:fly={{ y: 20, duration: 600, delay: 700 }} onclick={() => console.log('Open drafts')}>
          Open Drafts
        </button>
      </div>
    {/if}
  </div>
  
  <div class={styles.bottomButtons}>
    <button class={styles.textButton} transition:fly={{ y: 20, duration: 600, delay: 800 }} onclick={() => console.log('About')}>
      How to Use Squire
    </button>
    <button class={styles.textButton} transition:fly={{ y: 20, duration: 600, delay: 900 }} onclick={() => goto('/db')}>
      Database
    </button>
  </div>
</div>
