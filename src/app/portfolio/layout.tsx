import "../globals.css";
import type { ReactNode } from "react";

/**
 * Portfolio layout - nested layout that does not include html/body tags
 * (those are only in the root layout at src/app/layout.tsx)
 */
export default function PortfolioLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
