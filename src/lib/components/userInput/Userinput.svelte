<script lang="ts">
  import styles from './Userinput.module.scss';
  
  let inputValue = $state('');
</script>

<div class={styles.container}>
  <input 
    type="text" 
    bind:value={inputValue} 
    class={styles.hiddenInput}
  />
</div>
