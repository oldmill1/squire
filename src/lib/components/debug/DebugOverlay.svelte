<script lang="ts">
	import styles from './DebugOverlay.module.scss';
	import { debugStore, updateSliderValue } from '$lib/stores/debugStore';

	const debugInfo = $derived($debugStore);
	
	// Track previous values to detect changes
	let prevTransformValue = $state(0);
	let prevLineContainerHeight = $state(0);
	let prevLineCount = $state(0);
	let showTransformDot = $state(false);
	let showLineContainerDot = $state(false);
	let showLineCountDot = $state(false);

	function handleSliderChange(event: Event) {
		const target = event.target as HTMLInputElement;
		updateSliderValue(parseFloat(target.value));
	}

	// Watch for transform value changes
	$effect(() => {
		if (debugInfo.transformValue !== prevTransformValue) {
			prevTransformValue = debugInfo.transformValue;
			showTransformDot = true;
			setTimeout(() => {
				showTransformDot = false;
			}, 1000);
		}
	});

	// Watch for line container height changes
	$effect(() => {
		console.log('Height effect running - current:', debugInfo.lineContainerHeight, 'previous:', prevLineContainerHeight);
		if (debugInfo.lineContainerHeight !== prevLineContainerHeight) {
			console.log('Height changed! Showing dot');
			prevLineContainerHeight = debugInfo.lineContainerHeight;
			showLineContainerDot = true;
			setTimeout(() => {
				showLineContainerDot = false;
			}, 1000);
		}
	});

	// Watch for line count changes
	$effect(() => {
		if (debugInfo.lineCount !== prevLineCount) {
			prevLineCount = debugInfo.lineCount;
			showLineCountDot = true;
			setTimeout(() => {
				showLineCountDot = false;
			}, 1000);
		}
	});
</script>

<div class={styles.debugOverlay}>
	<div class={styles.content}>
		<div class={styles.title}>Debug Info</div>
		<div class={styles.info}>
			Transform: {debugInfo.transformValue.toFixed(2)}px
			{#if showTransformDot}
				<div class={`${styles.changeDot} ${styles.transform}`}></div>
			{/if}
		</div>
		<div class={styles.info}>
			Line Container Height: {debugInfo.lineContainerHeight.toFixed(2)}px
			{#if showLineContainerDot}
				<div class={`${styles.changeDot} ${styles.transform}`}></div>
			{/if}
		</div>
		<div class={styles.info}>
			Number of Lines: {debugInfo.lineCount}
			{#if showLineCountDot}
				<div class={`${styles.changeDot} ${styles.lineCount}`}></div>
			{/if}
		</div>
		<div class={styles.sliderContainer}>
			<label class={styles.sliderLabel} for="dummy-slider">Transform Control</label>
			<input 
				type="range" 
				min="0" 
				max={debugInfo.sliderMax || 10} 
				value={debugInfo.sliderValue} 
				class={styles.slider} 
				id="dummy-slider" 
				oninput={handleSliderChange}
			/>
			<div class={styles.sliderValues}>
				<span>0</span>
				<span>{debugInfo.sliderMax.toFixed(1)}</span>
			</div>
		</div>
	</div>
</div>
