import { writable } from 'svelte/store';

interface DebugInfo {
	transformValue: number;
	sliderValue: number;
	sliderMax: number;
	lineContainerHeight: number;
	lineCount: number;
}

export const debugStore = writable<DebugInfo>({
	transformValue: 0,
	sliderValue: 0,
	sliderMax: 0,
	lineContainerHeight: 0,
	lineCount: 0
});

export function updateTransformValue(value: number) {
	debugStore.update(current => {
		const newSliderMax = Math.max(current.sliderMax, value);
		return {
			...current,
			transformValue: value,
			sliderValue: value,
			sliderMax: newSliderMax
		};
	});
}

export function updateLineContainerInfo(height: number, lineCount: number) {
	debugStore.update(current => ({
		...current,
		lineContainerHeight: height,
		lineCount: lineCount
	}));
}

export function updateLineContainerHeight(height: number) {
	debugStore.update(current => ({
		...current,
		lineContainerHeight: height
	}));
}

export function updateLineCount(lineCount: number) {
	debugStore.update(current => ({
		...current,
		lineCount: lineCount
	}));
}

export function updateSliderValue(value: number) {
	debugStore.update(current => ({
		...current,
		sliderValue: value
	}));
}

export function resetDebugStore() {
	debugStore.set({
		transformValue: 0,
		sliderValue: 0,
		sliderMax: 0,
		lineContainerHeight: 0,
		lineCount: 0
	});
}
