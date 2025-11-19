<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import MenuBar from '$lib/components/menuBar/MenuBar.svelte';
	import DebugOverlay from '$lib/components/debug/DebugOverlay.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<MenuBar />
{@render children()}
<DebugOverlay />
