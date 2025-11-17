<script lang="ts">
  import styles from './Statusbar.module.scss';
  
  interface Props {
    leftText?: string;
    centerText?: string;
    rightText?: string;
  }
  
  let { leftText = 'Left Status', centerText = 'Center Status', rightText = 'Right Status' }: Props = $props();
</script>

<div class={styles.statusbar}>
  <div class={styles.left}>{leftText}</div>
  <div class={styles.center}>{centerText}</div>
  <div class={styles.right}>{rightText}</div>
</div>
