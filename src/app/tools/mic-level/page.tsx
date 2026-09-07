import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/seo/metadata";
import MicLevelClient from "./MicLevelClient";

export const metadata: Metadata = generateBaseMetadata({
	title: "Mic Level Checker",
	description:
		"ブラウザだけでマイク入力レベル (dBFS) をリアルタイム表示し、5秒間の発話から OBS 基準のゲイン調整量を判定するツール.音声は録音・送信されません.",
	path: "/tools/mic-level",
	keywords: [
		"マイク",
		"ゲイン",
		"dBFS",
		"OBS",
		"配信",
		"音量",
		"audio meter",
		"mic level",
	],
});

export default function MicLevelPage() {
	return <MicLevelClient />;
}
