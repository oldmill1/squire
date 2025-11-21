<script lang="ts">
  import { onMount } from 'svelte';
  
  let mounted = $state(false);
  
  onMount(() => {
    mounted = true;
  });
</script>

<div class="db-container">
  {#if mounted}
    <h1>Hello from the DB world</h1>
    <p>This page will be used to show an interactive view into your database.</p>
  {/if}
</div>

<style>
  .db-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    text-align: center;
  }
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #333;
  }
  
  p {
    font-size: 1.1rem;
    color: #666;
    max-width: 600px;
  }
</style>
