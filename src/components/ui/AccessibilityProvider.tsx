"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface AccessibilityContextType {
	announceToScreenReader: (
		message: string,
		priority?: "polite" | "assertive",
	) => void;
	keyboardNavigationActive: boolean;
	highContrastMode: boolean;
	reducedMotion: boolean;
	textScaling: number;
	enableKeyboardNavigation: () => void;
	disableKeyboardNavigation: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(
	null,
);

export const useAccessibilityContext = () => {
	const context = useContext(AccessibilityContext);
	if (!context) {
		throw new Error(
			"useAccessibilityContext must be used within AccessibilityProvider",
		);
	}
	return context;
};

interface AccessibilityProviderProps {
	children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
	children,
}) => {
	const [keyboardNavigationActive, setKeyboardNavigationActive] =
		useState(false);
	const [highContrastMode, setHighContrastMode] = useState(false);
	const [reducedMotion, setReducedMotion] = useState(false);
	const [textScaling, setTextScaling] = useState(1);

	// Announce messages to screen readers
	const announceToScreenReader = (
		message: string,
		priority: "polite" | "assertive" = "polite",
	) => {
		const regionId =
			priority === "assertive"
				? "urgent-announcement-region"
				: "announcement-region";
		const region = document.getElementById(regionId);

		if (region) {
			// Clear previous message
			region.textContent = "";

			// Add new message after a brief delay to ensure screen readers pick it up
			setTimeout(() => {
				region.textContent = message;
			}, 100);

			// Clear message after 5 seconds
			setTimeout(() => {
				region.textContent = "";
			}, 5000);
		}
	};

	// Enable keyboard navigation mode
	const enableKeyboardNavigation = () => {
		setKeyboardNavigationActive(true);
		document.documentElement.classList.add("keyboard-navigation-active");
	};

	// Disable keyboard navigation mode
	const disableKeyboardNavigation = () => {
		setKeyboardNavigationActive(false);
		document.documentElement.classList.remove("keyboard-navigation-active");
	};

	// Detect accessibility preferences
	useEffect(() => {
		if (typeof window === "undefined" || !window.matchMedia) {
			return;
		}

		// Check for high contrast mode
		const highContrastQuery = window.matchMedia("(prefers-contrast: high)");
		setHighContrastMode(highContrastQuery?.matches || false);

		const handleHighContrastChange = (e: MediaQueryListEvent) => {
			setHighContrastMode(e.matches);
		};

		// Check for reduced motion preference
		const reducedMotionQuery = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		);
		setReducedMotion(reducedMotionQuery?.matches || false);

		const handleReducedMotionChange = (e: MediaQueryListEvent) => {
			setReducedMotion(e.matches);
		};

		// Detect text scaling (simplified)
		const updateTextScaling = () => {
			if (typeof document !== "undefined" && document.documentElement) {
				try {
					const baseFontSize = 16;
					const currentFontSize = parseFloat(
						getComputedStyle(document.documentElement).fontSize,
					);
					let scaling = 1;
					if (!Number.isNaN(currentFontSize)) {
						scaling = currentFontSize / baseFontSize;
					}
					setTextScaling(scaling);
				} catch {
					setTextScaling(1); // fallback to default
				}
			} else {
				setTextScaling(1); // fallback for test environment
			}
		};

		// Keyboard navigation detection
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Tab") {
				enableKeyboardNavigation();
			}
		};

		const handleMouseDown = () => {
			disableKeyboardNavigation();
		};

		// Add event listeners
		highContrastQuery?.addEventListener("change", handleHighContrastChange);
		reducedMotionQuery?.addEventListener("change", handleReducedMotionChange);
		updateTextScaling();
		window.addEventListener("resize", updateTextScaling);
		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("mousedown", handleMouseDown);

		// Cleanup function
		return () => {
			highContrastQuery?.removeEventListener(
				"change",
				handleHighContrastChange,
			);
			reducedMotionQuery?.removeEventListener(
				"change",
				handleReducedMotionChange,
			);
			window.removeEventListener("resize", updateTextScaling);
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("mousedown", handleMouseDown);
		};
	}, [disableKeyboardNavigation, enableKeyboardNavigation]);

	const value: AccessibilityContextType = {
		announceToScreenReader,
		keyboardNavigationActive,
		highContrastMode,
		reducedMotion,
		textScaling,
		enableKeyboardNavigation,
		disableKeyboardNavigation,
	};

	return (
		<AccessibilityContext.Provider value={value}>
			{children}
		</AccessibilityContext.Provider>
	);
};
