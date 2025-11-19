import { writable } from 'svelte/store';

interface DebugInfo {
	transformValue: number;
	sliderValue: number;
	sliderMax: number;
}

export const debugStore = writable<DebugInfo>({
	transformValue: 0,
	sliderValue: 0,
	sliderMax: 0
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

export function updateSliderValue(value: number) {
	debugStore.update(current => ({
		...current,
		sliderValue: value
	}));
}
