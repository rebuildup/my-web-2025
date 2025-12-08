"use client";

import { useEffect, useRef, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
	const [storedValue, setStoredValue] = useState<T>(initialValue);
	const [isClient, setIsClient] = useState(false);
	const initialValueRef = useRef(initialValue);

	const setValue = (value: T | ((val: T) => T)) => {
		let valueToStore: T;
		if (value instanceof Function) {
			valueToStore = value(storedValue);
		} else {
			valueToStore = value;
		}

		setStoredValue(valueToStore);

		if (isClient) {
			if (typeof window !== "undefined") {
				try {
					window.localStorage.setItem(key, JSON.stringify(valueToStore));
				} catch (error) {
					console.error(`Error saving to localStorage key "${key}":`, error);
				}
			}
		}
	};

	useEffect(() => {
		if (typeof window === "undefined") return;

		let completed = false;
		try {
			const item = window.localStorage.getItem(key);
			if (item !== null) {
				setStoredValue(JSON.parse(item));
			} else {
				window.localStorage.setItem(
					key,
					JSON.stringify(initialValueRef.current),
				);
			}
			completed = true;
		} catch (error) {
			console.error(`Error reading localStorage key "${key}":`, error);
			completed = true;
		}

		if (completed) {
			setIsClient(true);
		}
	}, [key]);

	return [storedValue, setValue] as const;
}
