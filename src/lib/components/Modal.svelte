<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		content: any;
		isOpen: boolean;
		onClose: () => void;
	}

	let { content, isOpen, onClose }: Props = $props();

	let modalElement: HTMLElement | undefined = $state(undefined);
	let isVisible = $state(false);

	$effect(() => {
		if (isOpen) {
			isVisible = true;
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
			setTimeout(() => {
				isVisible = false;
			}, 300);
		}
	});

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
			document.body.style.overflow = '';
		};
	});
</script>

{#if isVisible}
	<div 
		class="modal-backdrop"
		class:modal-open={isOpen}
		class:modal-closing={!isOpen}
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onkeydown={handleKeydown}
	>
		<div 
			bind:this={modalElement}
			class="modal-content"
			class:content-open={isOpen}
			class:content-closing={!isOpen}
		>
			{@render content()}
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.3s ease, visibility 0.3s ease;
	}

	.modal-backdrop.modal-open {
		opacity: 1;
		visibility: visible;
	}

	.modal-backdrop.modal-closing {
		opacity: 0;
		visibility: hidden;
	}

	.modal-content {
		width: 60vw;
		height: 60vh;
		background: white;
		border-radius: 8px;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
		transform: scale(0.8);
		transition: transform 0.15s ease-out;
		overflow: auto;
	}

	.modal-content.content-open {
		animation: expandUp 0.3s ease-out;
	}

	.modal-content.content-closing {
		animation: shrinkDown 0.3s ease-in;
	}

	@keyframes expandUp {
		0% {
			transform: scale(0.8);
		}
		50% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
		}
	}

	@keyframes shrinkDown {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(0.8);
		}
	}

	@media (max-width: 768px) {
		.modal-content {
			width: 90vw;
			height: 80vh;
		}
	}
</style>
