/**
 * APIテスト用ヘルパー関数
 * 要件4: APIルートとサーバーサイド機能の完全テスト
 */

import { NextRequest, NextResponse } from "next/server";
import { createMockRequest } from "./mock-factories";

// APIテストの型定義
export interface ApiTestCase {
	method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	url: string;
	headers?: Record<string, string>;
	body?: unknown;
	expectedStatus: number;
	expectedResponse?: unknown;
	description: string;
}

export interface ApiTestResult {
	success: boolean;
	status: number;
	response: unknown;
	headers: Record<string, string>;
	duration: number;
	error?: string;
}

export interface ApiValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
}

/**
 * APIルートハンドラーのテスト実行
 */
export const testApiRoute = async (
	handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
	testCase: ApiTestCase,
): Promise<ApiTestResult> => {
	const startTime = performance.now();

	try {
		// リクエストの作成
		const request = createMockRequest(testCase.url, {
			method: testCase.method,
			headers: testCase.headers,
			body: testCase.body ? JSON.stringify(testCase.body) : undefined,
		}) as NextRequest;

		// ハンドラーの実行
		const response = await handler(request);
		const endTime = performance.now();

		// レスポンスの解析
		let responseData: unknown;
		try {
			responseData = await response.json();
		} catch {
			responseData = await response.text();
		}

		// ヘッダーの取得
		const headers: Record<string, string> = {};
		response.headers.forEach((value, key) => {
			headers[key] = value;
		});

		return {
			success: response.status === testCase.expectedStatus,
			status: response.status,
			response: responseData,
			headers,
			duration: endTime - startTime,
		};
	} catch (error) {
		const endTime = performance.now();
		return {
			success: false,
			status: 500,
			response: null,
			headers: {},
			duration: endTime - startTime,
			error: error instanceof Error ? error.message : String(error),
		};
	}
};

/**
 * 複数のAPIテストケースを実行
 */
export const runApiTestSuite = async (
	handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
	testCases: ApiTestCase[],
): Promise<{
	results: (ApiTestResult & { testCase: ApiTestCase })[];
	summary: {
		total: number;
		passed: number;
		failed: number;
		averageDuration: number;
	};
}> => {
	const results: (ApiTestResult & { testCase: ApiTestCase })[] = [];

	for (const testCase of testCases) {
		const result = await testApiRoute(handler, testCase);
		results.push({ ...result, testCase });
	}

	const passed = results.filter((r) => r.success).length;
	const failed = results.length - passed;
	const averageDuration =
		results.reduce((sum, r) => sum + r.duration, 0) / results.length;

	return {
		results,
		summary: {
			total: results.length,
			passed,
			failed,
			averageDuration,
		},
	};
};

/**
 * HTTPステータスコードの検証
 */
export const validateStatusCode = (
	actual: number,
	expected: number,
): ApiValidationResult => {
	const errors: string[] = [];
	const warnings: string[] = [];

	if (actual !== expected) {
		errors.push(`Expected status ${expected}, but got ${actual}`);
	}

	// 一般的なステータスコードの妥当性チェック
	if (actual < 100 || actual > 599) {
		errors.push(`Invalid HTTP status code: ${actual}`);
	}

	// 警告レベルのチェック
	if (actual >= 400 && actual < 500 && expected < 400) {
		warnings.push(`Client error status ${actual} might indicate a problem`);
	}

	if (actual >= 500 && expected < 500) {
		warnings.push(`Server error status ${actual} indicates a server problem`);
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
};

/**
 * レスポンスボディの検証
 */
export const validateResponseBody = (
	actual: unknown,
	expected: unknown,
	schema?: Record<string, (value: unknown) => boolean>,
): ApiValidationResult => {
	const errors: string[] = [];
	const warnings: string[] = [];

	// 期待値との比較
	if (expected !== undefined) {
		if (typeof expected === "object" && expected !== null) {
			// オブジェクトの場合は深い比較
			const compareObjects = (
				obj1: unknown,
				obj2: unknown,
				path: string = "",
			): void => {
				if (typeof obj1 !== typeof obj2) {
					errors.push(
						`Type mismatch at ${path}: expected ${typeof obj2}, got ${typeof obj1}`,
					);
					return;
				}

				if (obj2 !== null && typeof obj2 === "object") {
					const obj2Record = obj2 as Record<string, unknown>;
					const obj1Record = obj1 as Record<string, unknown>;
					Object.keys(obj2Record).forEach((key) => {
						const newPath = path ? `${path}.${key}` : key;
						if (!(key in obj1Record)) {
							errors.push(`Missing property at ${newPath}`);
						} else {
							compareObjects(obj1Record[key], obj2Record[key], newPath);
						}
					});
				} else if (obj1 !== obj2) {
					errors.push(
						`Value mismatch at ${path}: expected ${obj2}, got ${obj1}`,
					);
				}
			};

			compareObjects(actual, expected);
		} else {
			// プリミティブ値の比較
			if (actual !== expected) {
				errors.push(`Expected ${expected}, but got ${actual}`);
			}
		}
	}

	// スキーマ検証
	if (schema && typeof actual === "object" && actual !== null) {
		const actualRecord = actual as Record<string, unknown>;
		Object.entries(schema).forEach(([key, validator]) => {
			if (key in actualRecord) {
				if (!validator(actualRecord[key])) {
					errors.push(`Schema validation failed for property ${key}`);
				}
			} else {
				warnings.push(`Property ${key} is missing from response`);
			}
		});
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
};

/**
 * レスポンスヘッダーの検証
 */
export const validateResponseHeaders = (
	actual: Record<string, string>,
	expected: Record<string, string> = {},
): ApiValidationResult => {
	const errors: string[] = [];
	const warnings: string[] = [];

	// 期待されるヘッダーの確認
	Object.entries(expected).forEach(([key, value]) => {
		const actualValue = actual[key.toLowerCase()];
		if (!actualValue) {
			errors.push(`Missing header: ${key}`);
		} else if (actualValue !== value) {
			errors.push(`Header ${key}: expected ${value}, got ${actualValue}`);
		}
	});

	// セキュリティヘッダーの確認
	const securityHeaders = [
		"x-content-type-options",
		"x-frame-options",
		"x-xss-protection",
		"strict-transport-security",
	];

	securityHeaders.forEach((header) => {
		if (!actual[header]) {
			warnings.push(`Missing security header: ${header}`);
		}
	});

	// Content-Typeの確認
	if (
		actual["content-type"] &&
		!actual["content-type"].includes("application/json")
	) {
		warnings.push(`Unexpected content-type: ${actual["content-type"]}`);
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
};

/**
 * 認証・認可のテスト
 */
export const testAuthentication = async (
	handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
	url: string,
	options: {
		validToken?: string;
		invalidToken?: string;
		noToken?: boolean;
		requiredRole?: string;
	} = {},
): Promise<{
	withValidToken?: ApiTestResult;
	withInvalidToken?: ApiTestResult;
	withoutToken?: ApiTestResult;
	summary: {
		authenticationWorks: boolean;
		authorizationWorks: boolean;
		errors: string[];
	};
}> => {
	const results: {
		withValidToken?: ApiTestResult;
		withInvalidToken?: ApiTestResult;
		withoutToken?: ApiTestResult;
	} = {};
	const errors: string[] = [];

	// 有効なトークンでのテスト
	if (options.validToken) {
		results.withValidToken = await testApiRoute(handler, {
			method: "GET",
			url,
			headers: { Authorization: `Bearer ${options.validToken}` },
			expectedStatus: 200,
			description: "Test with valid token",
		});

		if (!results.withValidToken.success) {
			errors.push("Valid token was rejected");
		}
	}

	// 無効なトークンでのテスト
	if (options.invalidToken) {
		results.withInvalidToken = await testApiRoute(handler, {
			method: "GET",
			url,
			headers: { Authorization: `Bearer ${options.invalidToken}` },
			expectedStatus: 401,
			description: "Test with invalid token",
		});

		if (results.withInvalidToken.status !== 401) {
			errors.push("Invalid token was not properly rejected");
		}
	}

	// トークンなしでのテスト
	if (options.noToken) {
		results.withoutToken = await testApiRoute(handler, {
			method: "GET",
			url,
			expectedStatus: 401,
			description: "Test without token",
		});

		if (results.withoutToken.status !== 401) {
			errors.push("Request without token was not properly rejected");
		}
	}

	return {
		...results,
		summary: {
			authenticationWorks: errors.length === 0,
			authorizationWorks: options.requiredRole
				? results.withValidToken?.success || false
				: true,
			errors,
		},
	};
};

/**
 * エラーハンドリングのテスト
 */
export const testErrorHandling = async (
	handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
	errorScenarios: Array<{
		name: string;
		request: Omit<ApiTestCase, "expectedStatus" | "description">;
		expectedStatus: number;
		expectedErrorMessage?: string;
	}>,
): Promise<{
	results: Array<{
		scenario: string;
		result: ApiTestResult;
		isValid: boolean;
	}>;
	summary: {
		total: number;
		passed: number;
		failed: number;
	};
}> => {
	const results: Array<{
		scenario: string;
		result: ApiTestResult;
		isValid: boolean;
	}> = [];

	for (const scenario of errorScenarios) {
		const testCase: ApiTestCase = {
			...scenario.request,
			expectedStatus: scenario.expectedStatus,
			description: `Error handling: ${scenario.name}`,
		};

		const result = await testApiRoute(handler, testCase);

		let isValid = result.status === scenario.expectedStatus;

		// エラーメッセージの確認
		if (scenario.expectedErrorMessage && result.response) {
			const responseText =
				typeof result.response === "string"
					? result.response
					: JSON.stringify(result.response);

			if (!responseText.includes(scenario.expectedErrorMessage)) {
				isValid = false;
			}
		}

		results.push({
			scenario: scenario.name,
			result,
			isValid,
		});
	}

	const passed = results.filter((r) => r.isValid).length;

	return {
		results,
		summary: {
			total: results.length,
			passed,
			failed: results.length - passed,
		},
	};
};

/**
 * APIパフォーマンステスト
 */
export const testApiPerformance = async (
	handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
	testCase: ApiTestCase,
	options: {
		iterations?: number;
		maxDuration?: number;
		concurrency?: number;
	} = {},
): Promise<{
	averageDuration: number;
	minDuration: number;
	maxDuration: number;
	successRate: number;
	results: ApiTestResult[];
	isPerformant: boolean;
}> => {
	const { iterations = 10, maxDuration = 1000, concurrency = 1 } = options;
	const results: ApiTestResult[] = [];

	// 並行実行の場合
	if (concurrency > 1) {
		const batches = Math.ceil(iterations / concurrency);

		for (let batch = 0; batch < batches; batch++) {
			const batchPromises: Promise<ApiTestResult>[] = [];
			const batchSize = Math.min(concurrency, iterations - batch * concurrency);

			for (let i = 0; i < batchSize; i++) {
				batchPromises.push(testApiRoute(handler, testCase));
			}

			const batchResults = await Promise.all(batchPromises);
			results.push(...batchResults);
		}
	} else {
		// 順次実行
		for (let i = 0; i < iterations; i++) {
			const result = await testApiRoute(handler, testCase);
			results.push(result);
		}
	}

	// 統計計算
	const durations = results.map((r) => r.duration);
	const successCount = results.filter((r) => r.success).length;

	const averageDuration =
		durations.reduce((sum, d) => sum + d, 0) / durations.length;
	const minDuration = Math.min(...durations);
	const maxDurationValue = Math.max(...durations);
	const successRate = (successCount / results.length) * 100;

	return {
		averageDuration,
		minDuration,
		maxDuration: maxDurationValue,
		successRate,
		results,
		isPerformant: averageDuration <= maxDuration && successRate >= 95,
	};
};

/**
 * 包括的なAPI監査
 */
export const auditApi = async (
	handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
	config: {
		baseUrl: string;
		testCases: ApiTestCase[];
		authConfig?: {
			validToken?: string;
			invalidToken?: string;
			requiredRole?: string;
		};
		performanceConfig?: {
			maxDuration?: number;
			iterations?: number;
		};
	},
): Promise<{
	score: number;
	isHealthy: boolean;
	results: {
		functionality: Awaited<ReturnType<typeof runApiTestSuite>>;
		authentication?: Awaited<ReturnType<typeof testAuthentication>>;
		performance?: Awaited<ReturnType<typeof testApiPerformance>>;
	};
	recommendations: string[];
}> => {
	const results: {
		functionality: Awaited<ReturnType<typeof runApiTestSuite>>;
		authentication?: Awaited<ReturnType<typeof testAuthentication>>;
		performance?: Awaited<ReturnType<typeof testApiPerformance>>;
	} = {} as {
		functionality: Awaited<ReturnType<typeof runApiTestSuite>>;
		authentication?: Awaited<ReturnType<typeof testAuthentication>>;
		performance?: Awaited<ReturnType<typeof testApiPerformance>>;
	};
	const recommendations: string[] = [];
	let score = 0;
	let maxScore = 0;

	// 機能テスト
	results.functionality = await runApiTestSuite(handler, config.testCases);
	const functionalityScore =
		(results.functionality.summary.passed /
			results.functionality.summary.total) *
		40;
	score += functionalityScore;
	maxScore += 40;

	if (results.functionality.summary.failed > 0) {
		recommendations.push(
			`${results.functionality.summary.failed} functional tests failed`,
		);
	}

	// 認証テスト
	if (config.authConfig) {
		results.authentication = await testAuthentication(
			handler,
			config.baseUrl,
			config.authConfig,
		);
		if (results.authentication.summary.authenticationWorks) {
			score += 30;
		} else {
			recommendations.push("Authentication is not working properly");
		}
		maxScore += 30;
	}

	// パフォーマンステスト
	if (config.performanceConfig && config.testCases.length > 0) {
		results.performance = await testApiPerformance(
			handler,
			config.testCases[0], // 最初のテストケースを使用
			config.performanceConfig,
		);

		if (results.performance.isPerformant) {
			score += 30;
		} else {
			recommendations.push(
				`API performance is below threshold (avg: ${results.performance.averageDuration.toFixed(2)}ms)`,
			);
		}
		maxScore += 30;
	}

	const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

	return {
		score: finalScore,
		isHealthy: finalScore >= 80,
		results,
		recommendations,
	};
};
