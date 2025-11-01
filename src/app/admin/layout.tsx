import "../globals.css";
import { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="ja">
			<head />
			<body>{children}</body>
		</html>
	);
}
