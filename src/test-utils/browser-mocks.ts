// Test utilities for mocking browser APIs
export const mockMatchMedia = (matches = false) => {
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: jest.fn().mockImplementation((query) => ({
			matches,
			media: query,
			onchange: null,
			addListener: jest.fn(),
			removeListener: jest.fn(),
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
			dispatchEvent: jest.fn(),
		})),
	});
};

export const mockPerformanceAPI = () => {
	Object.defineProperty(global.performance, "memory", {
		writable: true,
		value: {
			usedJSHeapSize: 1000000,
			totalJSHeapSize: 2000000,
			jsHeapSizeLimit: 4000000,
		},
	});

	global.performance.now = jest.fn().mockReturnValue(Date.now());
};

export const mockNextNavigation = () => {
	jest.mock("next/navigation", () => ({
		useRouter: () => ({
			push: jest.fn(),
			replace: jest.fn(),
			prefetch: jest.fn(),
			back: jest.fn(),
			forward: jest.fn(),
			refresh: jest.fn(),
		}),
		useSearchParams: () => new URLSearchParams(),
		usePathname: () => "/",
		redirect: jest.fn(),
		notFound: jest.fn(),
	}));
};
