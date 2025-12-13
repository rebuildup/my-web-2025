/**
 * Production Initializer Provider
 * Initializes production environment settings and monitoring
 */

"use client";

import { type ReactNode, useEffect } from "react";
import {
	checkProductionReadiness,
	initProduction,
} from "@/lib/init/production";

interface ProductionInitializerProps {
	children: ReactNode;
}

export function ProductionInitializer({
	children,
}: ProductionInitializerProps) {
	useEffect(() => {
		// Only initialize in browser environment
		if (typeof window === "undefined") return;

		// Skip production readiness check in development
		const isProduction = process.env.NODE_ENV === "production";

		if (isProduction) {
			// Check production readiness
			const readiness = checkProductionReadiness();

			if (!readiness.ready) {
				console.error("Production readiness issues:", readiness.issues);
			}

			if (readiness.warnings.length > 0) {
				console.warn("Production warnings:", readiness.warnings);
			}
		}

		// Initialize production environment
		try {
			initProduction();
		} catch (error) {
			console.error("Failed to initialize production environment:", error);
		}
	}, []);

	return <>{children}</>;
}
