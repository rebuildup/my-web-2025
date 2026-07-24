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
		if (typeof window === "undefined") return;

		const start = () => {
			try {
				const isProduction = process.env.NODE_ENV === "production";
				if (isProduction) {
					const readiness = checkProductionReadiness();
					if (!readiness.ready) {
						console.error("Production readiness issues:", readiness.issues);
					}
					if (readiness.warnings.length > 0) {
						console.warn("Production warnings:", readiness.warnings);
					}
				}
				initProduction();
			} catch (error) {
				console.error("Failed to initialize production environment:", error);
			}
		};

		if (typeof window !== "undefined" && "requestIdleCallback" in window) {
			const id = window.requestIdleCallback(start, { timeout: 5000 });
			return () => window.cancelIdleCallback(id);
		}

		const id = setTimeout(start, 1000);
		return () => clearTimeout(id);
	}, []);

	return <>{children}</>;
}
