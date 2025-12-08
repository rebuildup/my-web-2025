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

	const handleRequestError = useCallback((status: number): Error => {
		return new Error(`Request failed with status ${status}`);
	}, []);

	const refresh = useCallback(async () => {
		abortController.current?.abort();
		const controller = new AbortController();
		abortController.current = controller;
		setLoading(true);
		setError(null);

		let response: Response;
		try {
			response = await fetch(endpoint, {
				signal: controller.signal,
				cache: "no-store",
			});
		} catch (fetchErr) {
			if ((fetchErr as Error).name === "AbortError") {
				setLoading(false);
				return;
			}
			setError(fetchErr);
			onError?.(fetchErr);
			setLoading(false);
			return;
		}

		if (!response.ok) {
			const error = handleRequestError(response.status);
			setError(error);
			onError?.(error);
			setLoading(false);
			return;
		}

		let raw: unknown;
		try {
			raw = await response.json();
		} catch (err) {
			if ((err as Error).name === "AbortError") {
				setLoading(false);
				return;
			}
			setError(err);
			onError?.(err);
			setLoading(false);
			return;
		}

		const parsedData = parse ? parse(raw) : (raw as T);
		setData(parsedData);
		setLoading(false);
	}, [endpoint, onError, parse, handleRequestError]);

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
				if (!controller.signal.aborted) {
					setLoading(false);
				}
			})
			.catch((err) => {
				if (err.name === "AbortError") {
					return;
				}
				setError(err);
				onError?.(err);
				if (!controller.signal.aborted) {
					setLoading(false);
				}
			});

		return () => {
			controller.abort();
		};
	}, [immediate, endpoint, parse, onError]);

	return { data, loading, error, refresh, setData };
}
