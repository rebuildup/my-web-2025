import type { StyleSettings } from "./types";

// プリセットテンプレート
export const presets: Record<string, StyleSettings> = {
	default: {
		colors: {
			bgColor: "#f0f2f5",
			textColor: "#222",
			accentColor: "#2c3e50",
			correctColor: "#27ae60",
			incorrectColor: "#c0392b",
			blockBg: "#fff",
		},
		textSize: {
			base: 16,
			title: 24,
			header: 20.8,
			section: 19.2,
			blank: 15,
		},
		button: {
			borderRadius: 4,
			padding: "8px 16px",
			fontSize: 14,
		},
		blank: {
			borderStyle: "solid",
			borderWidth: 1,
			backgroundColor: "#f9f9f9",
		},
		navTab: {
			borderRadius: 20,
			padding: "8px 14px",
			fontSize: 14,
		},
	},
	modern: {
		colors: {
			bgColor: "#ffffff",
			textColor: "#1a1a1a",
			accentColor: "#6366f1",
			correctColor: "#10b981",
			incorrectColor: "#ef4444",
			blockBg: "#f9fafb",
		},
		textSize: {
			base: 16,
			title: 28,
			header: 22,
			section: 18,
			blank: 16,
		},
		button: {
			borderRadius: 8,
			padding: "10px 20px",
			fontSize: 14,
		},
		blank: {
			borderStyle: "dashed",
			borderWidth: 2,
			backgroundColor: "#ffffff",
		},
		navTab: {
			borderRadius: 12,
			padding: "10px 16px",
			fontSize: 14,
		},
	},
	warm: {
		colors: {
			bgColor: "#fef3e2",
			textColor: "#3e2723",
			accentColor: "#d84315",
			correctColor: "#2e7d32",
			incorrectColor: "#c62828",
			blockBg: "#fff8e1",
		},
		textSize: {
			base: 17,
			title: 26,
			header: 21,
			section: 19,
			blank: 16,
		},
		button: {
			borderRadius: 6,
			padding: "9px 18px",
			fontSize: 15,
		},
		blank: {
			borderStyle: "solid",
			borderWidth: 2,
			backgroundColor: "#fff3e0",
		},
		navTab: {
			borderRadius: 16,
			padding: "9px 15px",
			fontSize: 15,
		},
	},
	minimal: {
		colors: {
			bgColor: "#fafafa",
			textColor: "#212121",
			accentColor: "#000000",
			correctColor: "#4caf50",
			incorrectColor: "#f44336",
			blockBg: "#ffffff",
		},
		textSize: {
			base: 15,
			title: 22,
			header: 18,
			section: 16,
			blank: 15,
		},
		button: {
			borderRadius: 0,
			padding: "8px 16px",
			fontSize: 13,
		},
		blank: {
			borderStyle: "solid",
			borderWidth: 1,
			backgroundColor: "#ffffff",
		},
		navTab: {
			borderRadius: 0,
			padding: "8px 12px",
			fontSize: 13,
		},
	},
};

export const defaultInput = `# 第1回 第二次世界大戦の終焉
## 第二次世界大戦の終焉
### 枢軸国の敗北・日本の敗戦
日本は開戦後半年間で「{{大東亜共栄圏|360}}」を唱え、1942年6月の{{ミッドウェー|120}}海戦で大敗した.

### 第二次世界大戦の結果
{{第二次世界大戦|160}}は民主主義の拡大につながり、冷戦構造（{{資本主義/社会主義|200}}）が形成された.`;
