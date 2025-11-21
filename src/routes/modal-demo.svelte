<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';

	let showModal = $state(false);

	function openModal() {
		showModal = true;
	}

	function closeModal() {
		showModal = false;
	}
</script>

<div class="demo-container">
	<h1>Modal Component Demo</h1>
	<p>Click the button below to see the modal in action with the expand/shrink animation.</p>
	
	<button class="demo-button" onclick={openModal}>
		Open Modal
	</button>

	{#if showModal}
		<Modal 
			content={() => `
				<div class="modal-demo-content">
					<h2>Modal Title</h2>
					<p>This is the modal content area. You can pass any Svelte component as the content prop.</p>
					<p>The modal features:</p>
					<ul>
						<li>Expand animation (scale to 120%, then back to 100%)</li>
						<li>Shrink animation on close</li>
						<li>Semi-transparent backdrop</li>
						<li>60% screen size, centered</li>
						<li>Click outside or press Escape to close</li>
					</ul>
					<button class="close-button" onclick=${closeModal}>Close Modal</button>
				</div>
			`}
			isOpen={showModal}
			onClose={closeModal}
		/>
	{/if}
</div>

<style>
	.demo-container {
		padding: 2rem;
		max-width: 800px;
		margin: 0 auto;
		text-align: center;
	}

	.demo-button {
		background: #3b82f6;
		color: white;
		border: none;
		padding: 1rem 2rem;
		border-radius: 0.5rem;
		font-size: 1.1rem;
		cursor: pointer;
		transition: background-color 0.2s;
		margin-top: 1rem;
	}

	.demo-button:hover {
		background: #2563eb;
	}

	.modal-demo-content {
		padding: 2rem;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.modal-demo-content h2 {
		margin-top: 0;
		color: #1f2937;
	}

	.modal-demo-content ul {
		text-align: left;
		margin: 1rem 0;
	}

	.close-button {
		background: #ef4444;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		cursor: pointer;
		margin-top: auto;
		align-self: flex-start;
		transition: background-color 0.2s;
	}

	.close-button:hover {
		background: #dc2626;
	}
</style>
