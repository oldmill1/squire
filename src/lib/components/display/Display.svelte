<script lang="ts">
  import styles from './Display.module.scss';
  import { fontSizeStore } from '$lib/stores/fontSizeStore';
  
  interface Props {
    content?: string;
  }
  
  let { content = '' }: Props = $props();
  
  const fontSize = $derived($fontSizeStore);
</script>

<div class={styles.display} style="font-size: {fontSize}rem;">
  {content}
</div>
