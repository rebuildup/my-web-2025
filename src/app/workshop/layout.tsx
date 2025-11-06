import "../globals.css";
import type { ReactNode } from "react";

/**
 * Workshop layout - nested layout that does not include html/body tags
 * (those are only in the root layout at src/app/layout.tsx)
 */
export default function WorkshopLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
