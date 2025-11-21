<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import styles from './+page.module.scss';

  let mounted = $state(false);
  
  // Background shape animations using reactive state
  let shape1Transform = $state('translate(0px, 0px) rotate(0deg) scale(1)');
  let shape2Transform = $state('translate(0px, 0px) rotate(0deg) scale(1)');
  let shape3Transform = $state('translate(0px, 0px) rotate(0deg) scale(1)');
  let shape4Transform = $state('translate(0px, 0px) rotate(0deg) scale(1)');
  
  onMount(() => {
    // Wait for client-side hydration before showing animations
    mounted = true;
    
    // Animate background shapes
    let time = 0;
    const animateShapes = () => {
      time += 0.01;
      
      // Shape 1: Gentle floating
      const shape1X = Math.sin(time * 0.3) * 30;
      const shape1Y = Math.cos(time * 0.2) * 20;
      const shape1Rotate = time * 20;
      const shape1Scale = 1 + Math.sin(time * 0.4) * 0.1;
      shape1Transform = `translate(${shape1X}px, ${shape1Y}px) rotate(${shape1Rotate}deg) scale(${shape1Scale})`;
      
      // Shape 2: Dynamic movement
      const shape2X = Math.cos(time * 0.5) * 25;
      const shape2Y = Math.sin(time * 0.3) * 15;
      const shape2Rotate = -time * 30;
      const shape2Scale = 1 + Math.sin(time * 0.6) * 0.2;
      shape2Transform = `translate(${shape2X}px, ${shape2Y}px) rotate(${shape2Rotate}deg) scale(${shape2Scale})`;
      
      // Shape 3: Complex pattern
      const shape3X = Math.sin(time * 0.4) * 20 + Math.cos(time * 0.7) * 10;
      const shape3Y = Math.cos(time * 0.5) * 30 + Math.sin(time * 0.3) * 10;
      const shape3Rotate = time * 15;
      const shape3Scale = 1 + Math.sin(time * 0.8) * 0.15;
      shape3Transform = `translate(${shape3X}px, ${shape3Y}px) rotate(${shape3Rotate}deg) scale(${shape3Scale})`;
      
      // Shape 4: Quick movement
      const shape4X = Math.sin(time * 0.8) * 15;
      const shape4Y = Math.cos(time * 0.9) * 20;
      const shape4Rotate = -time * 40;
      const shape4Scale = 1 + Math.sin(time * 1.0) * 0.25;
      shape4Transform = `translate(${shape4X}px, ${shape4Y}px) rotate(${shape4Rotate}deg) scale(${shape4Scale})`;
      
      requestAnimationFrame(animateShapes);
    };
    
    animateShapes();
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
      <h1 class={styles.appTitle} transition:fly={{ y: 20, duration: 600, delay: 200 }}><span class={styles.titleScript}>Squire</span></h1>
      <p class={styles.appSubtitle} transition:fly={{ y: 20, duration: 600, delay: 400 }}><span class={styles.futuraText}>FinalDraft</span> meets <span class={styles.codeText}>vim</span></p>
      
      <div class={styles.actionButtons}>
        <button class={styles.primaryButton} transition:fly={{ y: 20, duration: 600, delay: 600 }} onclick={() => goto('/draft')}>
          New Draft
        </button>
        <button class={styles.secondaryButton} transition:fly={{ y: 20, duration: 600, delay: 700 }} onclick={() => console.log('Open drafts')}>
          Open Drafts
        </button>
        <button class={styles.textButton} transition:fly={{ y: 20, duration: 600, delay: 800 }} onclick={() => console.log('About')}>
          About Squire
        </button>
      </div>
      
      <div class={styles.versionInfo} transition:fade={{ duration: 600, delay: 900 }}>
        <span class={styles.version}>@oldmill1</span>
        <span class={styles.separator}>•</span>
        <span class={styles.copyright}>© 2025 Squire</span>
      </div>
    {/if}
  </div>
  
  <div class={styles.backgroundShapes}>
    <div class="{styles.shape} {styles.shape1}" style="transform: {shape1Transform}"></div>
    <div class="{styles.shape} {styles.shape2}" style="transform: {shape2Transform}"></div>
    <div class="{styles.shape} {styles.shape3}" style="transform: {shape3Transform}"></div>
    <div class="{styles.shape} {styles.shape4}" style="transform: {shape4Transform}"></div>
  </div>
</div>
