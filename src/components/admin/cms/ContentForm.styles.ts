export const CONTENT_FORM_SECTIONS = [
	"概要",
	"サムネイル",
	"リンク・メディア",
	"検索・SEO",
	"権限・多言語・拡張",
	"リレーション",
	"構造",
] as const;

export const contentFormStyles = {
	col2: { display: "flex", flexDirection: "column" as const, gap: 12 },
	label: { marginBottom: 3 },
	input: { width: "100%", padding: "5px 8px", fontSize: 13, outline: "none" },
	textarea: {
		width: "100%",
		padding: "5px 8px",
		fontSize: 13,
		outline: "none",
		resize: "vertical" as const,
		fontFamily: "inherit",
	},
	btn: { padding: "4px 10px", fontSize: 12, cursor: "pointer" },
	btnPrimary: {
		padding: "4px 10px",
		fontSize: 12,
		cursor: "pointer",
		fontWeight: 600 as const,
	},
	btnDanger: {
		padding: "2px 6px",
		cursor: "pointer",
		display: "inline-flex",
		alignItems: "center",
	},
	chip: {
		display: "inline-flex",
		alignItems: "center",
		gap: 4,
		padding: "2px 8px",
	},
	sectionTitle: { fontSize: 13, fontWeight: 600 as const, marginBottom: 4 },
	helper: { fontSize: 11, marginTop: 2 },
	error: { fontSize: 11, marginTop: 2 },
	divider: { height: 1, margin: "8px 0" },
};
