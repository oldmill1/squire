<script lang="ts">
  import styles from './Display.module.scss';
  import { fontSizeStore } from '$lib/stores/fontSizeStore';
  import { textStore } from '$lib/stores/textStore';
  
  const fontSize = $derived($fontSizeStore);
  const currentText = $derived($textStore);
</script>

<div class={styles.display} style="font-size: {fontSize}rem;">
  {currentText}
</div>
