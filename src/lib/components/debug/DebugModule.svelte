<script lang="ts">
	import styles from './DebugModule.module.scss';
	import { debugStore, updateSliderValue } from '$lib/stores/debugStore';
	import { modeStore } from '$lib/stores/modeStore';
	import { currentLineStore } from '$lib/stores/currentLineStore';
	import { selectedLinesStore } from '$lib/stores/selectedLinesStore';
	import { cursorStore } from '$lib/stores/cursorStore';

	const debugInfo = $derived($debugStore);
	const currentMode = $derived($modeStore);
	const currentLine = $derived($currentLineStore);
	const selectedLines = $derived($selectedLinesStore);
	const cursorPosition = $derived($cursorStore);

	function handleSliderChange(event: Event) {
		const target = event.target as HTMLInputElement;
		updateSliderValue(parseFloat(target.value));
	}
</script>

<div class={`${styles.debugModule} ${currentMode === 'insert' ? styles.borderInteractive : styles.borderScript}`}>
	<div class={styles.content}>
		<div class={styles.info}>cursor: ({cursorPosition.col}, {cursorPosition.line})</div>
		<div class={styles.info}>want_col: {cursorPosition.want_col}</div>
		<div class={styles.info}>y: {debugInfo.transformValue.toFixed(2)}px</div>
		<div class={styles.info}>inc: {debugInfo.lastLineHeightIncrement.toFixed(2)}px</div>
		<div class={styles.info}>h: {debugInfo.lineContainerHeight.toFixed(2)}px</div>
		<div class={styles.info}>line: {currentLine + 1}</div>
		<div class={styles.info}>selected: [{selectedLines.map(l => l + 1).join(', ')}]</div>
		<div class={styles.sliderContainer}>
			<label class={styles.sliderLabel} for="dummy-slider">transform</label>
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
