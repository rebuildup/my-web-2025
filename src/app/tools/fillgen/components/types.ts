// 設定の型定義
export type StyleSettings = {
	colors: {
		bgColor: string;
		textColor: string;
		accentColor: string;
		correctColor: string;
		incorrectColor: string;
		blockBg: string;
	};
	textSize: {
		base: number;
		title: number;
		header: number;
		section: number;
		blank: number;
	};
	button: {
		borderRadius: number;
		padding: string;
		fontSize: number;
	};
	blank: {
		borderStyle: "solid" | "dashed" | "dotted" | "double";
		borderWidth: number;
		backgroundColor: string;
	};
	navTab: {
		borderRadius: number;
		padding: string;
		fontSize: number;
	};
};

export type Section = { title: string; paragraphs: string[] };
export type Block = { header: string; sections: Section[] };
export type Doc = { title: string; blocks: Block[] };
