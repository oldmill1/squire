<script lang="ts">
  import styles from './Statusbar.module.scss';
  import { modeStore, type Mode } from '$lib/stores/modeStore';
  
  interface Props {
    centerText?: string;
    rightText?: string;
  }
  
  let { centerText = 'Center Status', rightText = 'Right Status' }: Props = $props();
  
  const currentMode = $derived($modeStore);
  
  function getModeDisplay(mode: Mode): string {
    if (mode === 'script') return 'Script Mode';
    if (mode === 'interactive') return 'Interactive Mode';
    return mode; // This line should never be reached with current Mode type
  }
</script>

<div class={styles.statusbar}>
  <div class={styles.left}>{getModeDisplay(currentMode)}</div>
  <div class={styles.center}>{centerText}</div>
  <div class={styles.right}>{rightText}</div>
</div>
