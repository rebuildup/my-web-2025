"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseCmsResourceOptions<T> {
	immediate?: boolean;
	parse?: (raw: unknown) => T;
	onError?: (error: unknown) => void;
}

export interface CmsResourceState<T> {
	data: T | null;
	loading: boolean;
	error: unknown;
	refresh: () => Promise<void>;
	setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useCmsResource<T>(
	endpoint: string,
	options: UseCmsResourceOptions<T> = {},
): CmsResourceState<T> {
	const { immediate = true, parse, onError } = options;
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(immediate);
	const [error, setError] = useState<unknown>(null);
	const abortController = useRef<AbortController | null>(null);

	const refresh = useCallback(async () => {
		abortController.current?.abort();
		const controller = new AbortController();
		abortController.current = controller;
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(endpoint, {
				signal: controller.signal,
				cache: "no-store",
			});
			if (!response.ok) {
				throw new Error(`Request failed with status ${response.status}`);
			}
			const raw = await response.json();
			setData(parse ? parse(raw) : (raw as T));
		} catch (err) {
			if ((err as Error).name === "AbortError") {
				return;
			}
			setError(err);
			onError?.(err);
		} finally {
			setLoading(false);
		}
	}, [endpoint, onError, parse]);

	useEffect(() => {
		if (!immediate) {
			return;
		}
		// 初期マウント時のみ実行
		const controller = new AbortController();
		abortController.current = controller;
		setLoading(true);
		setError(null);

		fetch(endpoint, {
			signal: controller.signal,
			cache: "no-store",
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Request failed with status ${response.status}`);
				}
				return response.json();
			})
			.then((raw) => {
				if (controller.signal.aborted) return;
				setData(parse ? parse(raw) : (raw as T));
			})
			.catch((err) => {
				if (err.name === "AbortError") {
					return;
				}
				setError(err);
				onError?.(err);
			})
			.finally(() => {
				if (!controller.signal.aborted) {
					setLoading(false);
				}
			});

		return () => {
			controller.abort();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [immediate, endpoint]);

	return { data, loading, error, refresh, setData };
}
