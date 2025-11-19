<script lang="ts">
	import styles from './DebugOverlay.module.scss';
	import { debugStore, updateSliderValue } from '$lib/stores/debugStore';
	import { modeStore } from '$lib/stores/modeStore';

	const debugInfo = $derived($debugStore);
	const currentMode = $derived($modeStore);

	function handleSliderChange(event: Event) {
		const target = event.target as HTMLInputElement;
		updateSliderValue(parseFloat(target.value));
	}
</script>

<div class={`${styles.debugOverlay} ${currentMode === 'interactive' ? styles.borderInteractive : styles.borderScript}`}>
	<div class={styles.content}>
		<div class={styles.info}>Transform: {debugInfo.transformValue.toFixed(2)}px</div>
		<div class={styles.info}>Line Container Height: {debugInfo.lineContainerHeight.toFixed(2)}px</div>
		<div class={styles.info}>Number of Lines: {debugInfo.lineCount}</div>
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
