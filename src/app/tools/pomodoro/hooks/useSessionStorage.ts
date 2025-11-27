"use client";

import { useEffect, useRef, useState } from "react";

export function useSessionStorage<T>(key: string, initialValue: T) {
	const [storedValue, setStoredValue] = useState<T>(initialValue);
	const [isClient, setIsClient] = useState(false);
	const initialValueRef = useRef(initialValue);

	const setValue = (value: T | ((val: T) => T)) => {
		try {
			const valueToStore =
				value instanceof Function ? value(storedValue) : value;

			setStoredValue(valueToStore);

			if (isClient && typeof window !== "undefined") {
				window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
			}
		} catch (error) {
			console.error(`Error saving to sessionStorage key "${key}":`, error);
		}
	};

	useEffect(() => {
		if (typeof window === "undefined") return;

		try {
			const item = window.sessionStorage.getItem(key);
			if (item !== null) {
				setStoredValue(JSON.parse(item));
			} else {
				window.sessionStorage.setItem(
					key,
					JSON.stringify(initialValueRef.current),
				);
			}
		} catch (error) {
			console.error(`Error reading sessionStorage key "${key}":`, error);
		} finally {
			setIsClient(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key]);

	return [storedValue, setValue] as const;
}
