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

	// Use refs for callbacks to avoid effect dependencies
	const parseRef = useRef(parse);
	const onErrorRef = useRef(onError);

	useEffect(() => {
		parseRef.current = parse;
		onErrorRef.current = onError;
	}, [parse, onError]);

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
			onErrorRef.current?.(fetchErr);
			setLoading(false);
			return;
		}

		if (!response.ok) {
			const error = handleRequestError(response.status);
			setError(error);
			onErrorRef.current?.(error);
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
			onErrorRef.current?.(err);
			setLoading(false);
			return;
		}

		const parsedData = parseRef.current ? parseRef.current(raw) : (raw as T);
		setData(parsedData);
		setLoading(false);
	}, [endpoint, handleRequestError]);

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
				setData(parseRef.current ? parseRef.current(raw) : (raw as T));
				if (!controller.signal.aborted) {
					setLoading(false);
				}
			})
			.catch((err) => {
				if (err.name === "AbortError") {
					return;
				}
				setError(err);
				onErrorRef.current?.(err);
				if (!controller.signal.aborted) {
					setLoading(false);
				}
			});

		return () => {
			controller.abort();
		};
	}, [immediate, endpoint]);

	return { data, loading, error, refresh, setData };
}
