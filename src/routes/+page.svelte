<script lang="ts">
  import Userinput from '$lib/components/userInput/Userinput.svelte';
  import Statusbar from '$lib/components/statusBar/Statusbar.svelte';
  import Display from '$lib/components/display/Display.svelte';
  import ScrollBar from '$lib/components/scrollBar/ScrollBar.svelte';
  import { initializeShortcuts } from '$lib/services/shortcuts';
  import { textStore, loadFromLocalStorage } from '$lib/stores/textStore';
  import { debugStore } from '$lib/stores/debugStore';
  import { onMount } from 'svelte';

  // Load localStorage data immediately before component mounting
  loadFromLocalStorage();

  const debugInfo = $derived($debugStore);

  onMount(() => {
    initializeShortcuts();
  });
</script>

<Userinput />
<Statusbar centerText="" rightText="" />
<Display />
<ScrollBar 
  minValue={0} 
  maxValue={debugInfo.sliderMax || 100} 
  currentValue={debugInfo.sliderValue} 
/>
