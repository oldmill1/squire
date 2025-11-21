<script lang="ts">
  import styles from './SplashIcon.module.scss';
  
  interface Props {
    mounted: boolean;
  }
  
  let { mounted }: Props = $props();
</script>

<div class={styles.appIcon}>
  <div class={styles.iconInner}>
    {#if mounted}
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
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
