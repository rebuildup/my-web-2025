"use client";

import { Copy } from "lucide-react";
import Prism from "prismjs";
import { useEffect, useMemo, useState } from "react";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-php";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-swift";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-css";
import "prismjs/components/prism-scss";
import { EditableText } from "@/components/admin/page-editor/editor/EditableText";
import { SimpleSelect, type SimpleSelectOption } from "@/components/admin/ui";
import { adminColor } from "@/components/admin/ui/tokens";
import type { BlockComponentProps } from "../types";

type ViewMode = "edit" | "preview" | "split";

const ALIAS_MAP: Record<string, string> = {
	js: "javascript",
	jsx: "jsx",
	ts: "typescript",
	tsx: "tsx",
	sh: "bash",
	zsh: "bash",
	shell: "bash",
	py: "python",
	yml: "yaml",
	md: "markdown",
	html: "markup",
	xml: "markup",
	txt: "plaintext",
};

const LANGUAGE_OPTIONS: SimpleSelectOption[] = [
	{ value: "", label: "auto (plain)" },
	{ value: "javascript", label: "JavaScript" },
	{ value: "typescript", label: "TypeScript" },
	{ value: "tsx", label: "TSX" },
	{ value: "jsx", label: "JSX" },
	{ value: "bash", label: "Bash" },
	{ value: "python", label: "Python" },
	{ value: "java", label: "Java" },
	{ value: "cpp", label: "C++" },
	{ value: "c", label: "C" },
	{ value: "ruby", label: "Ruby" },
	{ value: "php", label: "PHP" },
	{ value: "go", label: "Go" },
	{ value: "rust", label: "Rust" },
	{ value: "kotlin", label: "Kotlin" },
	{ value: "swift", label: "Swift" },
	{ value: "sql", label: "SQL" },
	{ value: "json", label: "JSON" },
	{ value: "yaml", label: "YAML" },
	{ value: "markdown", label: "Markdown" },
	{ value: "markup", label: "HTML/XML" },
	{ value: "css", label: "CSS" },
	{ value: "scss", label: "SCSS" },
];

const editorStyle: React.CSSProperties = {
	fontFamily:
		'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
	fontSize: 13.5,
	lineHeight: 1.6,
	color: "#e5e7eb",
	backgroundColor: "transparent",
	borderRadius: 4,
	border: `1px solid ${adminColor.border}`,
	padding: 12,
	minHeight: 140,
	whiteSpace: "pre",
	overflowX: "auto",
};

const previewStyle: React.CSSProperties = {
	margin: 0,
	background: "transparent",
	borderRadius: 8,
	border: "1px solid rgba(255,255,255,0.12)",
	padding: 12,
};

const containerStyle: React.CSSProperties = {
	borderRadius: 12,
	backgroundColor: "transparent",
	border: `1px solid ${adminColor.border}`,
	padding: 0,
	position: "relative",
};

const controlsBarStyle: React.CSSProperties = {
	position: "absolute",
	top: 8,
	right: 8,
	display: "flex",
	alignItems: "center",
	gap: 8,
	opacity: 0,
	pointerEvents: "none",
	transition: "opacity 120ms ease",
	zIndex: 3,
};

const viewModeGroupStyle: React.CSSProperties = {
	display: "inline-flex",
	gap: 2,
	backgroundColor: "rgba(0,0,0,0.4)",
	borderRadius: 4,
	marginLeft: 8,
	color: "#fff",
};

const viewModeButtonStyle: React.CSSProperties = {
	padding: "4px 8px",
	fontSize: 13,
	background: "transparent",
	color: "#fff",
	border: "none",
	borderRadius: 2,
	cursor: "pointer",
};

const viewModeButtonActiveStyle: React.CSSProperties = {
	...viewModeButtonStyle,
	background: adminColor.accent,
};

const copyButtonStyle: React.CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	padding: 6,
	backgroundColor: "rgba(0,0,0,0.4)",
	border: "none",
	borderRadius: 4,
	color: "#fff",
	cursor: "pointer",
};

const previewWrapperStyle: React.CSSProperties = {
	position: "relative",
	padding: 16,
};

const splitLayoutStyle: React.CSSProperties = {
	display: "flex",
	gap: 16,
	alignItems: "stretch",
};

const splitColumnStyle: React.CSSProperties = {
	flex: 1,
	minWidth: 0,
};

function highlightCode(code: string, normalizedLang: string): string {
	const grammar =
		Prism.languages[normalizedLang] ||
		Prism.languages.markup ||
		(Prism.languages as unknown as Record<string, unknown>).plaintext;
	try {
		return Prism.highlight(code, grammar as unknown, normalizedLang);
	} catch {
		return code
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
	}
}

function normalizeLanguage(language: string): string {
	const input = (language || "").trim().toLowerCase();
	const preferred = input ? (ALIAS_MAP[input] ?? input) : "plaintext";
	return preferred || "plaintext";
}

function runPrismHighlightAll(root: HTMLElement | undefined | null) {
	if (typeof window === "undefined") return;
	window.requestAnimationFrame(() => {
		Prism.highlightAllUnder?.(root ?? document.body);
	});
}

export function CodeBlock({
	block,
	readOnly,
	onContentChange,
	onAttributesChange,
}: BlockComponentProps) {
	const language = (block.attributes.language as string | undefined) ?? "";

	const normalizedLang = useMemo(() => normalizeLanguage(language), [language]);

	const highlightedHtml = useMemo(
		() => highlightCode(block.content || "", normalizedLang),
		[block.content, normalizedLang],
	);

	useEffect(() => {
		if (normalizedLang !== "plaintext") {
			runPrismHighlightAll(null);
		}
	}, [normalizedLang]);

	const [viewMode, setViewMode] = useState<ViewMode>(() => {
		const saved = (block.attributes.viewMode as string | undefined) ?? "split";
		return saved === "edit" || saved === "preview" || saved === "split"
			? saved
			: "split";
	});
	const handleChangeView = (next: ViewMode) => {
		setViewMode(next);
		onAttributesChange({ viewMode: next });
	};

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(block.content || "");
		} catch {}
	};

	return (
		<section className="block-code" style={containerStyle}>
			{!readOnly && (
				<div style={controlsBarStyle} className="codeblock-controls">
					<div style={{ minWidth: 140, zIndex: 3 }}>
						<SimpleSelect
							size="small"
							value={language || ""}
							options={LANGUAGE_OPTIONS}
							onChange={(value) => onAttributesChange({ language: value })}
							minWidth={140}
							aria-label="Language"
						/>
					</div>
					<div role="group" aria-label="View mode" style={viewModeGroupStyle}>
						{(["edit", "split", "preview"] as const).map((mode) => {
							const label =
								mode === "edit" ? "E" : mode === "split" ? "S" : "P";
							const active = viewMode === mode;
							return (
								<button
									key={mode}
									type="button"
									aria-pressed={active}
									aria-label={mode}
									onClick={() => handleChangeView(mode)}
									style={
										active ? viewModeButtonActiveStyle : viewModeButtonStyle
									}
								>
									{label}
								</button>
							);
						})}
					</div>
					<button
						type="button"
						onClick={() => void handleCopy()}
						aria-label="Copy code"
						style={copyButtonStyle}
					>
						<Copy size={16} />
					</button>
				</div>
			)}
			<div style={previewWrapperStyle}>
				{readOnly || viewMode === "preview" ? (
					<pre className={`language-${normalizedLang}`} style={previewStyle}>
						<code
							className={`language-${normalizedLang}`}
							dangerouslySetInnerHTML={{
								__html: highlightedHtml,
							}}
						/>
					</pre>
				) : viewMode === "edit" ? (
					<EditableText
						value={block.content}
						onChange={onContentChange}
						readOnly={readOnly}
						placeholder="// Write code here"
						sx={editorStyle}
					/>
				) : (
					<div style={splitLayoutStyle}>
						<div style={splitColumnStyle}>
							<EditableText
								value={block.content}
								onChange={onContentChange}
								readOnly={readOnly}
								placeholder="// Write code here"
								sx={editorStyle}
							/>
						</div>
						<div style={splitColumnStyle}>
							<pre
								className={`language-${normalizedLang}`}
								style={previewStyle}
							>
								<code
									className={`language-${normalizedLang}`}
									dangerouslySetInnerHTML={{ __html: highlightedHtml }}
								/>
							</pre>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
