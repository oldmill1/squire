<script lang="ts">
  import Userinput from '$lib/components/userInput/Userinput.svelte';
  import Statusbar from '$lib/components/statusBar/Statusbar.svelte';
  import Display from '$lib/components/display/Display.svelte';
  import { initializeShortcuts } from '$lib/services/shortcuts';
  import { textStore } from '$lib/stores/textStore';
  import { onMount } from 'svelte';

  onMount(() => {
    initializeShortcuts();
    
    // Initialize with welcome message if textStore is empty
    textStore.update(lines => {
      if (lines.length === 0) {
        return [
          'Welcome to Squire - Your AI Coding Assistant',
          'Start typing to begin, or use shortcuts to switch modes',
          'Press Ctrl+Space to toggle between Script and Interactive modes'
        ];
      }
      return lines;
    });
  });
</script>

<Userinput />
<Statusbar centerText="" rightText="" />
<Display />
