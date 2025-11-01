import type { Metadata } from "next";
import OfflinePageClient from "./components/OfflinePageClient";

export const metadata: Metadata = {
	title: "オフライン - samuido",
	description:
		"インターネット接続を確認してください。一部のツールはオフラインでも利用可能です。",
	robots: "noindex, nofollow",
};

export default function OfflinePage() {
	return <OfflinePageClient />;
}
