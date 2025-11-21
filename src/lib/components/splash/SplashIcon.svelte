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
      <img src="/logo.png" alt="Squire Logo" width="80" height="80" />
    {/if}
  </div>
</div>
