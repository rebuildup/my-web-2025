// 共通のテストモック設定
import { jest } from "@jest/globals";
import React from "react";

// Next.js Image コンポーネントのモック
export const mockNextImage = () => {
	jest.mock("next/image", () => ({
		__esModule: true,
		default: (props: Record<string, unknown>) => {
			return React.createElement("img", { ...props, alt: props.alt || "" });
		},
	}));
};

// Next.js Router のモック
export const mockNextRouter = () => {
	const mockRouter = {
		push: jest.fn(),
		replace: jest.fn(),
		back: jest.fn(),
		forward: jest.fn(),
		refresh: jest.fn(),
		prefetch: jest.fn(),
	};

	jest.mock("next/navigation", () => ({
		useRouter: () => mockRouter,
		usePathname: () => "/",
		useSearchParams: () => new URLSearchParams(),
	}));

	return mockRouter;
};

// React hooks のモック
export const mockReactHooks = () => {
	jest.mock("react", () => ({
		...(jest.requireActual("react") as object),
		useEffect: jest.fn((fn: () => void) => fn()),
		useCallback: jest.fn((fn: () => void) => fn),
		useMemo: jest.fn((fn: () => unknown) => fn()),
	}));
};

// Web APIs のモック
export const mockWebAPIs = () => {
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: jest.fn().mockImplementation((query) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: jest.fn(),
			removeListener: jest.fn(),
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
			dispatchEvent: jest.fn(),
		})),
	});

	Object.defineProperty(window, "ResizeObserver", {
		writable: true,
		value: jest.fn().mockImplementation(() => ({
			observe: jest.fn(),
			unobserve: jest.fn(),
			disconnect: jest.fn(),
		})),
	});

	Object.defineProperty(window, "IntersectionObserver", {
		writable: true,
		value: jest.fn().mockImplementation(() => ({
			observe: jest.fn(),
			unobserve: jest.fn(),
			disconnect: jest.fn(),
		})),
	});
};

// 共通のセットアップ関数
export const setupCommonMocks = () => {
	mockNextImage();
	mockNextRouter();
	mockReactHooks();
	mockWebAPIs();
};
