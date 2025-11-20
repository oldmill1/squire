import { vi } from 'vitest';

// Mock SvelteKit runtime
vi.mock('$app/environment', () => ({
	dev: true,
	building: false,
	version: '1.0.0'
}));

vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidate: vi.fn(),
	invalidateAll: vi.fn()
}));

vi.mock('$app/stores', () => ({
	navigating: { subscribe: vi.fn() },
	page: { subscribe: vi.fn() },
	session: { subscribe: vi.fn() }
}));
