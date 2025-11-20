import { writable } from 'svelte/store';

interface DebugInfo {
	transformValue: number;
	lastTransformValue: number;
	transformChangeAmount: number;
	lastLineHeightIncrement: number;
	sliderValue: number;
	sliderMax: number;
	lineContainerHeight: number;
	lineCount: number;
}

export const debugStore = writable<DebugInfo>({
	transformValue: 0,
	lastTransformValue: 0,
	transformChangeAmount: 0,
	lastLineHeightIncrement: 0,
	sliderValue: 0,
	sliderMax: 0,
	lineContainerHeight: 0,
	lineCount: 0
});

export function updateTransformValue(value: number) {
	debugStore.update(current => {
		const newSliderMax = Math.max(current.sliderMax, value);
		const changeAmount = value - current.transformValue;
		return {
			...current,
			lastTransformValue: current.transformValue,
			transformValue: value,
			transformChangeAmount: changeAmount,
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

export function updateLineHeightIncrement(increment: number) {
	debugStore.update(current => ({
		...current,
		lastLineHeightIncrement: increment
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
		lastTransformValue: 0,
		transformChangeAmount: 0,
		lastLineHeightIncrement: 0,
		sliderValue: 0,
		sliderMax: 0,
		lineContainerHeight: 0,
		lineCount: 0
	});
}
