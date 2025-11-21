<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import MenuBar from '$lib/components/menuBar/MenuBar.svelte';
	import DebugModule from '$lib/components/debug/DebugModule.svelte';
	import { debugVisibilityStore } from '$lib/stores/debugVisibilityStore';
	import PouchDBInitializer from '$lib/components/PouchDBInitializer.svelte';
	import { onMount } from 'svelte';
	import { settingsService } from '$lib/services/settingsService';
	import { lineNumberVisibilityStore } from '$lib/stores/lineNumberStore';

	let { children } = $props();

	const debugVisible = $derived($debugVisibilityStore);

	// Load settings when app initializes
	onMount(async () => {
		// Wait for PouchDB to be ready by checking the global instance
		const waitForPouchDBGlobal = () => {
			return new Promise<void>((resolve) => {
				const check = () => {
					if (typeof window !== 'undefined' && (window as any).pouchDBInstance) {
						resolve();
					} else {
						setTimeout(check, 50);
					}
				};
				check();
			});
		};

		try {
			// Wait for PouchDB to be available
			await waitForPouchDBGlobal();
			
			// Load lineNumbers setting (default to false - hidden)
			const lineNumbers = await settingsService.getSetting('lineNumbers', false);
			console.log('📋 Loaded lineNumbers setting:', lineNumbers);
			
			// Apply the setting to the line number store
			lineNumberVisibilityStore.set(lineNumbers);
			
		} catch (error) {
			console.error('❌ Failed to load settings:', error);
			// Use default value if loading fails (hidden)
			lineNumberVisibilityStore.set(false);
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<PouchDBInitializer />
{@render children()}
{#if debugVisible}
	<DebugModule />
{/if}
