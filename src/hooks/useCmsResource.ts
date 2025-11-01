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
		void refresh();
		return () => {
			abortController.current?.abort();
		};
	}, [immediate, refresh]);

	return { data, loading, error, refresh, setData };
}
