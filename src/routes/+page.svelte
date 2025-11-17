<script lang="ts">
  import Userinput from '$lib/components/userInput/Userinput.svelte';
  import Statusbar from '$lib/components/statusBar/Statusbar.svelte';
  import Display from '$lib/components/display/Display.svelte';
  import { initializeShortcuts } from '$lib/services/shortcuts';
  import { onMount } from 'svelte';

  onMount(() => {
    initializeShortcuts();
  });
</script>

<Userinput />
<Statusbar />
<Display />
