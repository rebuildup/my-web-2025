/**
 * 共通テストヘルパー関数
 * 要件7.2: 共通のテストユーティリティが再利用可能な形で提供されること
 */

import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { ReactElement } from "react";
import { TestWrapper } from "./test-wrapper";

// テスト用の共通プロパティ
export const commonTestProps = {
	"data-testid": "test-component",
	"aria-label": "Test component",
};

// テスト用の共通スタイル
export const commonTestStyles = {
	width: "100px",
	height: "100px",
	backgroundColor: "transparent",
};

/**
 * カスタムレンダー関数
 * TestWrapperでコンポーネントをラップしてレンダリング
 */
export const renderWithWrapper = (
	ui: ReactElement,
	options?: Omit<RenderOptions, "wrapper">,
): RenderResult => {
	return render(ui, {
		wrapper: TestWrapper,
		...options,
	});
};

/**
 * 非同期コンポーネントのテストヘルパー
 */
export const waitForAsyncComponent = async (
	renderFn: () => Promise<RenderResult> | RenderResult,
): Promise<RenderResult> => {
	const result = await renderFn();
	// 非同期処理の完了を待つ
	await new Promise((resolve) => setTimeout(resolve, 0));
	return result;
};

/**
 * エラー境界のテストヘルパー
 */
export const triggerErrorBoundary = (
	component: RenderResult,
	error: Error,
): void => {
	// エラーを発生させてエラー境界をトリガー
	const errorComponent = component.container.querySelector(
		'[data-testid="error-trigger"]',
	);
	if (errorComponent) {
		// エラーイベントを発火
		const errorEvent = new ErrorEvent("error", {
			error,
			message: error.message,
		});
		errorComponent.dispatchEvent(errorEvent);
	}
};

/**
 * フォーム送信のテストヘルパー
 */
export const submitForm = async (
	component: RenderResult,
	formData: Record<string, string>,
): Promise<void> => {
	const form = component.container.querySelector("form");
	if (!form) throw new Error("Form not found");

	// フォームフィールドに値を設定
	Object.entries(formData).forEach(([name, value]) => {
		const field = form.querySelector(`[name="${name}"]`) as HTMLInputElement;
		if (field) {
			field.value = value;
			field.dispatchEvent(new Event("change", { bubbles: true }));
		}
	});

	// フォーム送信
	form.dispatchEvent(new Event("submit", { bubbles: true }));
	await new Promise((resolve) => setTimeout(resolve, 0));
};

/**
 * キーボードイベントのテストヘルパー
 */
export const simulateKeyboardEvent = (
	element: Element,
	key: string,
	eventType: "keydown" | "keyup" | "keypress" = "keydown",
): void => {
	const event = new KeyboardEvent(eventType, {
		key,
		code: key,
		bubbles: true,
	});
	element.dispatchEvent(event);
};

/**
 * マウスイベントのテストヘルパー
 */
export const simulateMouseEvent = (
	element: Element,
	eventType: "click" | "mouseenter" | "mouseleave" | "mousedown" | "mouseup",
	options?: MouseEventInit,
): void => {
	const event = new MouseEvent(eventType, {
		bubbles: true,
		cancelable: true,
		...options,
	});
	element.dispatchEvent(event);
};

/**
 * タッチイベントのテストヘルパー
 */
export const simulateTouchEvent = (
	element: Element,
	eventType: "touchstart" | "touchend" | "touchmove",
	touches: Array<{ clientX: number; clientY: number }>,
): void => {
	const touchList = touches.map((touch) => ({
		...touch,
		identifier: Math.random(),
		target: element,
	}));

	const event = new TouchEvent(eventType, {
		bubbles: true,
		cancelable: true,
	});

	// TouchListは読み取り専用なので、直接設定はできません
	// 代わりにObjectDefinePropertyを使用してモックします
	Object.defineProperty(event, "touches", { value: touchList });
	Object.defineProperty(event, "targetTouches", { value: touchList });
	Object.defineProperty(event, "changedTouches", { value: touchList });
	element.dispatchEvent(event);
};

/**
 * レスポンシブテストのヘルパー
 */
export const setViewportSize = (width: number, height: number): void => {
	Object.defineProperty(window, "innerWidth", {
		writable: true,
		configurable: true,
		value: width,
	});
	Object.defineProperty(window, "innerHeight", {
		writable: true,
		configurable: true,
		value: height,
	});
	window.dispatchEvent(new Event("resize"));
};

/**
 * メディアクエリのテストヘルパー
 */
export const mockMediaQuery = (
	query: string,
	matches: boolean,
): jest.MockedFunction<typeof window.matchMedia> => {
	const mockMatchMedia = jest.fn().mockImplementation((q) => ({
		matches: q === query ? matches : false,
		media: q,
		onchange: null,
		addListener: jest.fn(),
		removeListener: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	}));

	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: mockMatchMedia,
	});

	return mockMatchMedia;
};

/**
 * ローカルストレージのテストヘルパー
 */
export const mockLocalStorage = (
	initialData: Record<string, string> = {},
): {
	getItem: jest.MockedFunction<Storage["getItem"]>;
	setItem: jest.MockedFunction<Storage["setItem"]>;
	removeItem: jest.MockedFunction<Storage["removeItem"]>;
	clear: jest.MockedFunction<Storage["clear"]>;
} => {
	const storage = { ...initialData };

	const localStorageMock = {
		getItem: jest.fn((key: string) => storage[key] || null),
		setItem: jest.fn((key: string, value: string) => {
			storage[key] = value;
		}),
		removeItem: jest.fn((key: string) => {
			delete storage[key];
		}),
		clear: jest.fn(() => {
			Object.keys(storage).forEach((key) => delete storage[key]);
		}),
	};

	Object.defineProperty(window, "localStorage", {
		writable: true,
		value: localStorageMock,
	});

	return localStorageMock;
};

/**
 * セッションストレージのテストヘルパー
 */
export const mockSessionStorage = (): {
	getItem: jest.MockedFunction<Storage["getItem"]>;
	setItem: jest.MockedFunction<Storage["setItem"]>;
	removeItem: jest.MockedFunction<Storage["removeItem"]>;
	clear: jest.MockedFunction<Storage["clear"]>;
} => {
	const sessionStorageMock = {
		getItem: jest.fn(),
		setItem: jest.fn(),
		removeItem: jest.fn(),
		clear: jest.fn(),
	};

	Object.defineProperty(window, "sessionStorage", {
		writable: true,
		value: sessionStorageMock,
	});

	return sessionStorageMock;
};

/**
 * パフォーマンス測定のテストヘルパー
 */
export const measureTestPerformance = <T>(
	testFn: () => T,
	testName: string,
): T => {
	const startTime = performance.now();
	const result = testFn();
	const endTime = performance.now();
	const duration = endTime - startTime;

	console.log(`⏱️ Test "${testName}" took ${duration.toFixed(2)}ms`);

	return result;
};

/**
 * メモリ使用量のテストヘルパー
 */
export const trackMemoryUsage = (testName: string): void => {
	if (performance.memory) {
		const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
		console.log(
			`🧠 Memory usage for "${testName}": ${Math.round(usedJSHeapSize / 1024 / 1024)}MB / ${Math.round(totalJSHeapSize / 1024 / 1024)}MB`,
		);
	}
};

/**
 * テストデータの検証ヘルパー
 */
export const validateTestData = <T>(
	data: T,
	schema: Record<string, (value: unknown) => boolean>,
): boolean => {
	if (typeof data !== "object" || data === null) {
		return false;
	}

	return Object.entries(schema).every(([key, validator]) => {
		const value = (data as Record<string, unknown>)[key];
		return validator(value);
	});
};

/**
 * 非同期処理の待機ヘルパー
 */
export const waitFor = (ms: number): Promise<void> => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * 条件待機のヘルパー
 */
export const waitForCondition = async (
	condition: () => boolean,
	timeout: number = 5000,
	interval: number = 100,
): Promise<void> => {
	const startTime = Date.now();

	while (!condition()) {
		if (Date.now() - startTime > timeout) {
			throw new Error(`Condition not met within ${timeout}ms`);
		}
		await waitFor(interval);
	}
};
