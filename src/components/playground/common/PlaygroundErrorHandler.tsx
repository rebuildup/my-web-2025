/**
 * Playground Error Handler Component
 * Handles and displays playground-specific errors with recovery options
 * Task 1.3: プレイグラウンド共通機能の実装
 */

"use client";

import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { useCallback, useState } from "react";
import type { PlaygroundError } from "@/types/playground";

interface PlaygroundErrorHandlerProps {
	error: PlaygroundError;
	onRetry?: () => void;
	onDismiss?: () => void;
	className?: string;
}

export function PlaygroundErrorHandler({
	error,
	onRetry,
	onDismiss,
	className = "",
}: PlaygroundErrorHandlerProps) {
	const [isRetrying, setIsRetrying] = useState(false);

	const handleRetry = useCallback(async () => {
		if (!onRetry || !error.recoverable) return;

		setIsRetrying(true);
		try {
			await onRetry();
		} catch (retryError) {
			console.error("Retry failed:", retryError);
		} finally {
			setIsRetrying(false);
		}
	}, [onRetry, error.recoverable]);

	const getErrorIcon = () => {
		switch (error.type) {
			case "webgl":
				return "🎮";
			case "performance":
				return "⚡";
			case "compatibility":
				return "🔧";
			case "runtime":
				return "⚠️";
			default:
				return "❌";
		}
	};

	const getErrorColor = () => {
		switch (error.type) {
			case "webgl":
				return "  ";
			case "performance":
				return "  ";
			case "compatibility":
				return "  ";
			case "runtime":
				return "  ";
			default:
				return "  ";
		}
	};

	const getSuggestions = () => {
		switch (error.type) {
			case "webgl":
				return [
					"WebGLが有効になっているか確認してください",
					"ブラウザを最新版に更新してください",
					"ハードウェアアクセラレーションを有効にしてください",
					"別のブラウザで試してください",
				];
			case "performance":
				return [
					"品質設定を下げてください",
					"他のアプリケーションを閉じてください",
					"ブラウザのタブを減らしてください",
					"デバイスを再起動してください",
				];
			case "compatibility":
				return [
					"ブラウザを最新版に更新してください",
					"対応ブラウザで試してください",
					"デバイスの仕様を確認してください",
				];
			case "runtime":
				return [
					"ページを再読み込みしてください",
					"ブラウザのキャッシュをクリアしてください",
					"しばらく時間をおいて再試行してください",
				];
			default:
				return ["ページを再読み込みしてください"];
		}
	};

	return (
		<div className={` rounded-lg p-4 ${getErrorColor()} ${className}`}>
			<div className="flex items-start justify-between">
				<div className="flex items-start space-x-3">
					<div className="text-2xl">{getErrorIcon()}</div>
					<div className="flex-1">
						<div className="flex items-center space-x-2">
							<AlertTriangle className="w-5 h-5" />
							<h3 className="font-semibold text-lg">
								{error.type.charAt(0).toUpperCase() + error.type.slice(1)} Error
							</h3>
						</div>
						<p className="mt-2 text-sm">{error.message}</p>
						{error.details && (
							<details className="mt-2">
								<summary className="text-sm cursor-pointer hover:underline">
									Technical Details
								</summary>
								<pre className="mt-1 text-xs  bg-opacity-10 p-2 rounded overflow-x-auto">
									{error.details}
								</pre>
							</details>
						)}
					</div>
				</div>

				{onDismiss && (
					<button
						type="button"
						onClick={onDismiss}
						className=""
						aria-label="Dismiss error"
					>
						<X className="w-5 h-5" />
					</button>
				)}
			</div>

			{/* Suggestions */}
			<div className="mt-4">
				<h4 className="font-medium text-sm mb-2">解決方法:</h4>
				<ul className="text-sm space-y-1">
					{getSuggestions().map((suggestion, index) => (
						<li key={suggestion} className="flex items-start space-x-2">
							<span className="text-xs mt-1">•</span>
							<span>{suggestion}</span>
						</li>
					))}
				</ul>
			</div>

			{/* Actions */}
			<div className="mt-4 flex items-center space-x-3">
				{error.recoverable && onRetry && (
					<button
						type="button"
						onClick={handleRetry}
						disabled={isRetrying}
						className="flex items-center space-x-2 px-3 py-1"
					>
						<RefreshCw
							className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`}
						/>
						<span className="text-sm">
							{isRetrying ? "再試行中..." : "再試行"}
						</span>
					</button>
				)}

				<button
					type="button"
					onClick={() => window.location.reload()}
					className="flex items-center space-x-2 px-3 py-1"
				>
					<RefreshCw className="w-4 h-4" />
					<span className="text-sm">ページ再読み込み</span>
				</button>
			</div>
		</div>
	);
}

interface PlaygroundErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: (error: PlaygroundError) => React.ReactNode;
	onError?: (error: PlaygroundError) => void;
}

function PlaygroundErrorBoundary({
	children,
	fallback,
	onError,
}: PlaygroundErrorBoundaryProps) {
	const [error, setError] = useState<PlaygroundError | null>(null);

	const handleError = useCallback(
		(error: Error, errorInfo?: { componentStack: string }) => {
			const playgroundError: PlaygroundError = {
				type: "runtime",
				message: error.message,
				details: errorInfo?.componentStack || error.stack,
				recoverable: true,
			};

			setError(playgroundError);
			onError?.(playgroundError);
		},
		[onError],
	);

	const handleRetry = useCallback(() => {
		setError(null);
	}, []);

	if (error) {
		if (fallback) {
			return <>{fallback(error)}</>;
		}

		return (
			<PlaygroundErrorHandler
				error={error}
				onRetry={handleRetry}
				className="m-4"
			/>
		);
	}

	try {
		return <>{children}</>;
	} catch (caughtError) {
		handleError(caughtError as Error);
		return null;
	}
}
