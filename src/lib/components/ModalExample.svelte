<script lang="ts">
	import Modal from './Modal.svelte';

	let showModal = $state(false);

	function openModal() {
		showModal = true;
	}

	function closeModal() {
		showModal = false;
	}
</script>

<div>
	<h2>Modal Component Example</h2>
	<button onclick={openModal}>Open Modal</button>

	{#if showModal}
		<Modal 
			content={() => `
				<div style="padding: 2rem;">
					<h2>Modal Content</h2>
					<p>This is an example of the modal content. You can pass any Svelte component here.</p>
					<button onclick={closeModal}>Close Modal</button>
				</div>
			`}
			isOpen={showModal}
			onClose={closeModal}
		/>
	{/if}
</div>
