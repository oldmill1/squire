<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import MenuBar from '$lib/components/menuBar/MenuBar.svelte';
	import DebugModule from '$lib/components/debug/DebugModule.svelte';
	import { debugVisibilityStore } from '$lib/stores/debugVisibilityStore';

	let { children } = $props();

	const debugVisible = $derived($debugVisibilityStore);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<MenuBar />
{@render children()}
{#if debugVisible}
	<DebugModule />
{/if}
