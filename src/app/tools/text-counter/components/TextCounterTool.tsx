"use client";

import { getEncoding } from "js-tiktoken";
import { useCallback, useMemo, useState } from "react";
import { RawDOMContainer } from "../../components/RawDOMContainer";
import type { CountSettings, TextStats } from "../types";
import { calculateTextStats } from "../utils/textAnalysis";

const DEFAULT_SETTINGS: CountSettings = {
	includeSpaces: true,
	includeNewlines: true,
	includeWhitespace: true,
	countMethod: "all",
	targetLength: 400,
	minLength: 1000,
	maxLength: 1000,
	checkHalfKana: false,
	specificString: "",
	excludeHtml: false,
	excludeUrls: false,
};

export default function TextCounterTool() {
	const [text, setText] = useState("");
	const [settings, setSettings] = useState<CountSettings>(DEFAULT_SETTINGS);
	const [isTokenizerOpen, setIsTokenizerOpen] = useState(false);

	const stats: TextStats = useMemo(() => {
		return calculateTextStats(text, settings);
	}, [text, settings]);

	const tokenData = useMemo(() => {
		if (!isTokenizerOpen || !text)
			return { count: null, blocks: [] as { id: number; str: string }[] };
		try {
			const enc = getEncoding("o200k_base");
			const tokens = enc.encode(text);
			const blocks = [];
			for (let i = 0; i < tokens.length; i++) {
				blocks.push({ id: tokens[i], str: enc.decode([tokens[i]]) });
			}
			return { count: tokens.length, blocks };
		} catch (e) {
			console.error("Tokenizer error:", e);
			return { count: null, blocks: [] };
		}
	}, [text, isTokenizerOpen]);

	const handleTextChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setText(e.target.value);
		},
		[],
	);

	const handleClear = useCallback(() => {
		setText("");
	}, []);

	const handleCopyText = useCallback(() => {
		navigator.clipboard.writeText(text);
	}, [text]);

	const handleSettingChange = (key: keyof CountSettings, value: any) => {
		setSettings((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<RawDOMContainer
			title="Text Counter"
			breadcrumbs={[
				{ label: "Home", href: "/" },
				{ label: "Tools", href: "/tools" },
				{ label: "Text Counter" },
			]}
		>
			{/* Override responsive styles minimally via inline media queries isn't easy, so we rely on flex-wrap or auto-fit. */}
			<div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
				{/* Left: Input & Basic Actions */}
				<div
					style={{
						flex: "1 1 500px",
						display: "flex",
						flexDirection: "column",
						gap: "15px",
					}}
				>
					<textarea
						value={text}
						onChange={handleTextChange}
						placeholder="Enter text here..."
						style={{
							all: "revert",
							width: "100%",
							height: "400px",
							padding: "10px",
							boxSizing: "border-box",
							fontFamily: "monospace",
						}}
					/>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "10px",
						}}
					>
						<button
							onClick={handleClear}
							style={{
								all: "revert",
								padding: "4px 12px",
								fontSize: "13px",
								width: "100%",
								boxSizing: "border-box",
							}}
						>
							Clear
						</button>
						<button
							onClick={handleCopyText}
							style={{
								all: "revert",
								padding: "4px 12px",
								fontSize: "13px",
								width: "100%",
								boxSizing: "border-box",
							}}
						>
							Copy Text
						</button>
					</div>

					{/* Settings Fieldset */}
					<fieldset style={{ border: "1px solid #ccc", padding: "15px" }}>
						<legend>Settings</legend>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: "10px",
								fontSize: "0.9rem",
							}}
						>
							<label
								style={{
									display: "flex",
									alignItems: "center",
									gap: "5px",
									cursor: "pointer",
								}}
							>
								<input
									type="checkbox"
									checked={settings.includeSpaces}
									onChange={(e) =>
										handleSettingChange("includeSpaces", e.target.checked)
									}
									style={{ all: "revert" }}
								/>
								Include Spaces
							</label>
							<label
								style={{
									display: "flex",
									alignItems: "center",
									gap: "5px",
									cursor: "pointer",
								}}
							>
								<input
									type="checkbox"
									checked={settings.includeNewlines}
									onChange={(e) =>
										handleSettingChange("includeNewlines", e.target.checked)
									}
									style={{ all: "revert" }}
								/>
								Include Newlines
							</label>
							<label
								style={{
									display: "flex",
									alignItems: "center",
									gap: "5px",
									cursor: "pointer",
								}}
							>
								<input
									type="checkbox"
									checked={settings.checkHalfKana}
									onChange={(e) =>
										handleSettingChange("checkHalfKana", e.target.checked)
									}
									style={{ all: "revert" }}
								/>
								Check Half-width Kana
							</label>
							<label
								style={{
									display: "flex",
									alignItems: "center",
									gap: "5px",
									cursor: "pointer",
								}}
							>
								<input
									type="checkbox"
									checked={settings.excludeHtml}
									onChange={(e) =>
										handleSettingChange("excludeHtml", e.target.checked)
									}
									style={{ all: "revert" }}
								/>
								Exclude HTML
							</label>
							<label
								style={{
									display: "flex",
									alignItems: "center",
									gap: "5px",
									cursor: "pointer",
								}}
							>
								<input
									type="checkbox"
									checked={settings.excludeUrls}
									onChange={(e) =>
										handleSettingChange("excludeUrls", e.target.checked)
									}
									style={{ all: "revert" }}
								/>
								Exclude URLs
							</label>
						</div>
						<div
							style={{
								marginTop: "15px",
								display: "grid",
								gridTemplateColumns: "120px 1fr",
								gap: "10px",
								alignItems: "center",
								fontSize: "0.9rem",
							}}
						>
							<label htmlFor="specificString">Specific String:</label>
							<input
								id="specificString"
								type="text"
								value={settings.specificString}
								onChange={(e) =>
									handleSettingChange("specificString", e.target.value)
								}
								style={{ all: "revert", padding: "2px 4px" }}
								placeholder="Count occurrences..."
							/>
						</div>
						<div
							style={{
								marginTop: "10px",
								display: "grid",
								gridTemplateColumns: "120px 1fr",
								gap: "10px",
								alignItems: "center",
								fontSize: "0.9rem",
							}}
						>
							<label htmlFor="targetLength">Target Length:</label>
							<input
								id="targetLength"
								type="number"
								value={settings.targetLength}
								onChange={(e) =>
									handleSettingChange("targetLength", Number(e.target.value))
								}
								style={{ all: "revert", padding: "2px 4px" }}
							/>
						</div>
						<div
							style={{
								marginTop: "10px",
								display: "grid",
								gridTemplateColumns: "120px 1fr",
								gap: "10px",
								alignItems: "center",
								fontSize: "0.9rem",
							}}
						>
							<label htmlFor="maxLength">Max Length:</label>
							<input
								id="maxLength"
								type="number"
								value={settings.maxLength}
								onChange={(e) =>
									handleSettingChange("maxLength", Number(e.target.value))
								}
								style={{ all: "revert", padding: "2px 4px" }}
							/>
						</div>
					</fieldset>
				</div>

				{/* Right: Statistics */}
				<div
					style={{
						flex: "1 1 300px",
						display: "flex",
						flexDirection: "column",
						gap: "20px",
					}}
				>
					{/* Progress Bars */}
					<fieldset style={{ border: "1px solid #ccc", padding: "15px" }}>
						<legend>Progress</legend>
						<div
							style={{ display: "flex", flexDirection: "column", gap: "15px" }}
						>
							{/* Target Progress */}
							<div
								style={{ display: "flex", flexDirection: "column", gap: "5px" }}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										fontSize: "0.85rem",
									}}
								>
									<span>Target: {stats.totalCharacters} chars</span>
									<span>{settings.targetLength}</span>
								</div>
								<progress
									value={stats.totalCharacters}
									max={settings.targetLength}
									style={{ all: "revert", width: "100%", height: "15px" }}
								/>
							</div>

							{/* Max Limit Progress */}
							<div
								style={{ display: "flex", flexDirection: "column", gap: "5px" }}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										fontSize: "0.85rem",
									}}
								>
									<span>Max Limit: {stats.totalCharacters} chars</span>
									<span>{settings.maxLength}</span>
								</div>
								<progress
									value={stats.totalCharacters}
									max={settings.maxLength}
									style={{ all: "revert", width: "100%", height: "15px" }}
								/>
							</div>
						</div>
					</fieldset>

					{/* Basic Stats Table */}
					<fieldset style={{ border: "1px solid #ccc", padding: "15px" }}>
						<legend>Basic Statistics</legend>
						<table
							style={{
								width: "100%",
								borderCollapse: "collapse",
								textAlign: "left",
								fontSize: "0.95rem",
							}}
						>
							<tbody>
								<tr style={{ borderBottom: "1px solid #eee" }}>
									<th style={{ padding: "6px 0", fontWeight: "normal" }}>
										Total Characters
									</th>
									<td style={{ padding: "6px 0", textAlign: "right" }}>
										{stats.totalCharacters}
									</td>
								</tr>
								<tr style={{ borderBottom: "1px solid #eee" }}>
									<th style={{ padding: "6px 0", fontWeight: "normal" }}>
										No Spaces
									</th>
									<td style={{ padding: "6px 0", textAlign: "right" }}>
										{stats.charactersWithoutSpaces}
									</td>
								</tr>
								<tr style={{ borderBottom: "1px solid #eee" }}>
									<th style={{ padding: "6px 0", fontWeight: "normal" }}>
										Words
									</th>
									<td style={{ padding: "6px 0", textAlign: "right" }}>
										{stats.wordCount}
									</td>
								</tr>
								<tr style={{ borderBottom: "1px solid #eee" }}>
									<th style={{ padding: "6px 0", fontWeight: "normal" }}>
										Lines
									</th>
									<td style={{ padding: "6px 0", textAlign: "right" }}>
										{stats.lineCount}
									</td>
								</tr>
								<tr style={{ borderBottom: "1px solid #eee" }}>
									<th style={{ padding: "6px 0", fontWeight: "normal" }}>
										Paragraphs
									</th>
									<td style={{ padding: "6px 0", textAlign: "right" }}>
										{stats.paragraphCount}
									</td>
								</tr>
								<tr style={{ borderBottom: "1px solid #eee" }}>
									<th style={{ padding: "6px 0", fontWeight: "normal" }}>
										Sentences
									</th>
									<td style={{ padding: "6px 0", textAlign: "right" }}>
										{stats.sentenceCount}
									</td>
								</tr>
								<tr style={{ borderBottom: "1px solid #eee" }}>
									<th style={{ padding: "6px 0", fontWeight: "normal" }}>
										Byte Size (UTF-8)
									</th>
									<td style={{ padding: "6px 0", textAlign: "right" }}>
										{stats.byteSizeUTF8} B
									</td>
								</tr>
								<tr style={{ borderBottom: "1px solid #eee" }}>
									<th style={{ padding: "6px 0", fontWeight: "normal" }}>
										400-char Pages
									</th>
									<td style={{ padding: "6px 0", textAlign: "right" }}>
										{stats.manuscriptPages400.toFixed(1)}
									</td>
								</tr>
							</tbody>
						</table>
					</fieldset>

					{/* Character Types Table */}
					<fieldset style={{ border: "1px solid #ccc", padding: "15px" }}>
						<legend>Character Types</legend>
						<table
							style={{
								width: "100%",
								borderCollapse: "collapse",
								textAlign: "left",
								fontSize: "0.95rem",
							}}
						>
							<tbody>
								<tr style={{ borderBottom: "1px solid #eee" }}>
									<th style={{ padding: "6px 0", fontWeight: "normal" }}>
										Hiragana
									</th>
									<td style={{ padding: "6px 0", textAlign: "right" }}>
										{stats.characterTypes.hiragana}
									</td>
								</tr>
								<tr style={{ borderBottom: "1px solid #eee" }}>
									<th style={{ padding: "6px 0", fontWeight: "normal" }}>
										Katakana
									</th>
									<td style={{ padding: "6px 0", textAlign: "right" }}>
										{stats.characterTypes.katakana}
									</td>
								</tr>
								<tr style={{ borderBottom: "1px solid #eee" }}>
									<th style={{ padding: "6px 0", fontWeight: "normal" }}>
										Kanji
									</th>
									<td style={{ padding: "6px 0", textAlign: "right" }}>
										{stats.characterTypes.kanji}
									</td>
								</tr>
								<tr style={{ borderBottom: "1px solid #eee" }}>
									<th style={{ padding: "6px 0", fontWeight: "normal" }}>
										Alphanumeric
									</th>
									<td style={{ padding: "6px 0", textAlign: "right" }}>
										{stats.characterTypes.alphanumeric}
									</td>
								</tr>
								<tr style={{ borderBottom: "1px solid #eee" }}>
									<th style={{ padding: "6px 0", fontWeight: "normal" }}>
										Symbols
									</th>
									<td style={{ padding: "6px 0", textAlign: "right" }}>
										{stats.characterTypes.symbols}
									</td>
								</tr>
								{settings.specificString && (
									<tr
										style={{
											borderBottom: "1px solid #eee",
											backgroundColor: "#f9f9f9",
										}}
									>
										<th style={{ padding: "6px 0", fontWeight: "bold" }}>
											"{settings.specificString}"
										</th>
										<td
											style={{
												padding: "6px 0",
												textAlign: "right",
												fontWeight: "bold",
											}}
										>
											{stats.specificStringCount}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</fieldset>

					{/* Tokenizer */}
					<details
						style={{ border: "1px solid #ccc", padding: "10px" }}
						onToggle={(e) =>
							setIsTokenizerOpen((e.target as HTMLDetailsElement).open)
						}
					>
						<summary style={{ cursor: "pointer", fontSize: "0.95rem" }}>
							Tokenizer (o200k_base) -{" "}
							<strong>
								{tokenData.count !== null
									? tokenData.count
									: "Click to calculate"}
							</strong>{" "}
							Tokens
						</summary>
						<div
							style={{
								marginTop: "10px",
								padding: "10px",
								border: "1px solid #eee",
								backgroundColor: "#fff",
								maxHeight: "300px",
								overflowY: "auto",
								fontSize: "0.95rem",
								whiteSpace: "pre-wrap",
								wordBreak: "break-all",
								lineHeight: "1.4",
							}}
						>
							{tokenData.blocks.map((block, i) => {
								const colors = [
									"#ffecb3",
									"#b3e5fc",
									"#c8e6c9",
									"#f8bbd0",
									"#e1bee7",
								];
								const color = colors[i % colors.length];
								return (
									<span
										key={i}
										style={{ backgroundColor: color }}
										title={`Token ID: ${block.id}`}
									>
										{block.str}
									</span>
								);
							})}
							{tokenData.blocks.length === 0 &&
								isTokenizerOpen &&
								text.length > 0 && <span>Loading tokens...</span>}
							{text.length === 0 && (
								<span style={{ color: "#999" }}>[ No Data ]</span>
							)}
						</div>
					</details>
				</div>
			</div>
		</RawDOMContainer>
	);
}
