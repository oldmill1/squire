<script lang="ts">
  import { goto } from '$app/navigation';
  import { fade, fly, slide } from 'svelte/transition';
  import { onMount } from 'svelte';
  import styles from './+page.module.scss';

  let mounted = $state(false);
  
  onMount(() => {
    // Wait for client-side hydration before showing animations
    mounted = true;
  });
</script>

<div class={styles.splashContainer}>
  <div class={styles.splashContent}>
    <div class={styles.appIcon}>
      <div class={styles.iconInner}>
        {#if mounted}
          <svg transition:fly={{ y: -20, duration: 800, delay: 0 }} width="80" height="80" viewBox="0 0 80 80" fill="none">
            <path d="M20 20 L60 20 L60 60 L20 60 Z" fill="url(#gradient)" stroke="none"/>
            <path d="M30 30 L35 30 L35 50 L30 50 Z" fill="white" opacity="0.9"/>
            <path d="M40 30 L45 30 L45 50 L40 50 Z" fill="white" opacity="0.9"/>
            <path d="M50 30 L55 30 L55 50 L50 50 Z" fill="white" opacity="0.9"/>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#007AFF;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#5856D6;stop-opacity:1" />
              </linearGradient>
            </defs>
          </svg>
        {/if}
      </div>
    </div>
    
    {#if mounted}
      <h1 class={styles.appTitle} transition:fly={{ y: 20, duration: 600, delay: 200 }}>Scribe</h1>
      <p class={styles.appSubtitle} transition:fly={{ y: 20, duration: 600, delay: 400 }}>Write beautifully. Think clearly.</p>
      
      <div class={styles.actionButtons}>
        <button class={styles.primaryButton} transition:fly={{ y: 20, duration: 600, delay: 600 }} onclick={() => goto('/draft')}>
          New Draft
        </button>
        <button class={styles.secondaryButton} transition:fly={{ y: 20, duration: 600, delay: 700 }} onclick={() => console.log('Open drafts')}>
          Open Drafts
        </button>
        <button class={styles.textButton} transition:fly={{ y: 20, duration: 600, delay: 800 }} onclick={() => console.log('About')}>
          About Scribe
        </button>
      </div>
      
      <div class={styles.versionInfo} transition:fade={{ duration: 600, delay: 900 }}>
        <span class={styles.version}>Version 1.0</span>
        <span class={styles.separator}>•</span>
        <span class={styles.copyright}>© 2025 Scribe</span>
      </div>
    {/if}
  </div>
  
  <div class={styles.backgroundShapes}>
    <div class="{styles.shape} {styles.shape1}"></div>
    <div class="{styles.shape} {styles.shape2}"></div>
    <div class="{styles.shape} {styles.shape3}"></div>
    <div class="{styles.shape} {styles.shape4}"></div>
  </div>
</div>
