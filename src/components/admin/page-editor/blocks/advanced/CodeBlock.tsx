"use client";

import { Copy } from "lucide-react";
import Prism from "prismjs";
import { useEffect, useMemo, useState } from "react";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import { EditableText } from "@/components/admin/page-editor/editor/EditableText";
import { SimpleSelect, type SimpleSelectOption } from "@/components/admin/ui";
import { adminColor } from "@/components/admin/ui/tokens";
import type { BlockComponentProps } from "../types";

type ViewMode = "edit" | "preview" | "split";

async function loadPrismLanguage(name: string): Promise<boolean> {
	try {
		await import(`prismjs/components/prism-${name}.js` as unknown as string);
		return true;
	} catch {
		return false;
	}
}

export function CodeBlock({
	block,
	readOnly,
	onContentChange,
	onAttributesChange,
}: BlockComponentProps) {
	const language = (block.attributes.language as string | undefined) ?? "";
	const aliasMap: Record<string, string> = {
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

	const normalizedLang = useMemo(() => {
		const input = (language || "").trim().toLowerCase();
		const preferred = input ? (aliasMap[input] ?? input) : "plaintext";
		return preferred || "plaintext";
	}, [language]);

	const languageOptions = useMemo<SimpleSelectOption[]>(
		() => [
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
		],
		[],
	);

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

	useEffect(() => {
		let mounted = true;
		const name = normalizedLang.replace(/[^a-z0-9-]/g, "");
		if (!name || name === "plaintext") return;
		const load = async () => {
			const completed = await loadPrismLanguage(name);

			if (completed && mounted) {
				requestAnimationFrame(() => {
					Prism.highlightAllUnder?.(document.body);
				});
			}
		};
		void load();
		return () => {
			mounted = false;
		};
	}, [normalizedLang]);

	const highlightedHtml = useMemo(() => {
		const code = block.content || "";
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
	}, [block.content, normalizedLang]);

	const handleCopy = async () => {
		let textToCopy = "";
		if (block.content) {
			textToCopy = block.content;
		}

		try {
			await navigator.clipboard.writeText(textToCopy);
		} catch {}
	};

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

	return (
		<section
			style={{
				borderRadius: 12,
				backgroundColor: "transparent",
				border: `1px solid ${adminColor.border}`,
				padding: 0,
				position: "relative",
			}}
		>
			{!readOnly && (
				<div
					style={{
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
					}}
					className="codeblock-controls"
				>
					<div style={{ minWidth: 140, zIndex: 3 }}>
						<SimpleSelect
							size="small"
							value={language || ""}
							options={languageOptions}
							onChange={(value) => onAttributesChange({ language: value })}
							minWidth={140}
							aria-label="Language"
						/>
					</div>
					<div
						role="group"
						aria-label="View mode"
						style={{
							display: "inline-flex",
							gap: 2,
							backgroundColor: "rgba(0,0,0,0.4)",
							borderRadius: 4,
							marginLeft: 8,
							color: "#fff",
						}}
					>
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
									style={{
										padding: "4px 8px",
										fontSize: 13,
										background: active ? adminColor.accent : "transparent",
										color: "#fff",
										border: "none",
										borderRadius: 2,
										cursor: "pointer",
									}}
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
						style={{
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							padding: 6,
							backgroundColor: "rgba(0,0,0,0.4)",
							border: "none",
							borderRadius: 4,
							color: "#fff",
							cursor: "pointer",
						}}
					>
						<Copy size={16} />
					</button>
				</div>
			)}
			<div style={{ position: "relative", padding: 16 }}>
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
					<div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
						<div style={{ flex: 1, minWidth: 0 }}>
							<EditableText
								value={block.content}
								onChange={onContentChange}
								readOnly={readOnly}
								placeholder="// Write code here"
								sx={editorStyle}
							/>
						</div>
						<div style={{ flex: 1, minWidth: 0 }}>
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
