<script lang="ts">
  import styles from './ModeStatus.module.scss';
  import { modeStore, type Mode } from '$lib/stores/modeStore';
  import { commandStore } from '$lib/stores/commandStore';
  
  const currentMode = $derived($modeStore);
  const currentCommand = $derived($commandStore);
  
  // Left section shows mode and command input when in command mode
  const displayText = $derived(
    currentMode === 'command' ? `:${currentCommand}` : getModeDisplay(currentMode)
  );
  
  function getModeDisplay(mode: Mode): string {
    if (mode === 'normal') return '';
    if (mode === 'insert') return 'Insert';
    if (mode === 'command') return ':';
    if (mode === 'visual_char') return 'Visual';
    return mode; // This line should never be reached with current Mode type
  }
</script>

<div class={styles.modeStatus}>{displayText}</div>
