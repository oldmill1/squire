<script lang="ts">
  import Userinput from '$lib/components/userInput/Userinput.svelte';
  import Statusbar from '$lib/components/statusBar/Statusbar.svelte';
  import Display from '$lib/components/display/Display.svelte';
  import { initializeShortcuts } from '$lib/services/shortcuts';
  import { textStore, loadFromLocalStorage } from '$lib/stores/textStore';
  import { onMount } from 'svelte';

  // Load localStorage data immediately before component mounting
  loadFromLocalStorage();

  onMount(() => {
    initializeShortcuts();
  });
</script>

<Userinput />
<Statusbar centerText="" rightText="" />
<Display />
