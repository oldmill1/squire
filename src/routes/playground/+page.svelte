<script lang="ts">
  import Cursor from '$lib/components/cursor/Cursor.svelte';
  import { modeStore } from '$lib/stores/modeStore';
  import { setMode } from '$lib/stores/modeStore';
  import { onMount } from 'svelte';

  onMount(() => {
    // Start in interactive mode to see the cursor
    setMode('interactive');
  });
</script>

<div class="playground">
  <h1>Cursor Playground</h1>
  <p>This is a testing area for the cursor component.</p>
  
  <div class="test-area">
    <h2>Basic Cursor Test</h2>
    <p>Press 'i' to enter interactive mode and see the cursor:</p>
    <div class="text-display">
      Hello World<Cursor />
    </div>
  </div>

  <div class="instructions">
    <h3>Instructions:</h3>
    <ul>
      <li>Press 'i' to enter interactive mode (cursor visible)</li>
      <li>Press 'Escape' to enter script mode (cursor hidden)</li>
      <li>Type to add text when in interactive mode</li>
    </ul>
  </div>
</div>

<style>
  .playground {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
    font-family: 'JetBrains Mono', monospace;
  }

  h1 {
    color: #e2e8f0;
    margin-bottom: 2rem;
  }

  h2 {
    color: #94a3b8;
    margin-bottom: 1rem;
  }

  h3 {
    color: #94a3b8;
    margin-bottom: 0.5rem;
  }

  p {
    color: #e2e8f0;
    margin-bottom: 1rem;
  }

  .test-area {
    background-color: #191D24;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .text-display {
    background-color: #0f1419;
    padding: 1rem;
    border-radius: 4px;
    font-size: 1.1rem;
    line-height: 1.6;
    color: #e2e8f0;
    white-space: pre-wrap;
    min-height: 100px;
    margin-top: 1rem;
  }

  .instructions {
    background-color: #191D24;
    padding: 1.5rem;
    border-radius: 8px;
  }

  ul {
    color: #e2e8f0;
    margin-left: 1.5rem;
  }

  li {
    margin-bottom: 0.5rem;
  }
</style>
