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

type TokenBlock = { id: number; str: string };

function TextInputSection({
	text,
	onTextChange,
	onClear,
	onCopy,
}: {
	text: string;
	onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	onClear: () => void;
	onCopy: () => void;
}) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "15px",
			}}
		>
			<textarea
				value={text}
				onChange={onTextChange}
				placeholder="Enter text here..."
				style={{
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
					type="button"
					onClick={onClear}
					style={{
						padding: "4px 12px",
						fontSize: "13px",
						width: "100%",
						boxSizing: "border-box",
					}}
				>
					Clear
				</button>
				<button
					type="button"
					onClick={onCopy}
					style={{
						padding: "4px 12px",
						fontSize: "13px",
						width: "100%",
						boxSizing: "border-box",
					}}
				>
					Copy Text
				</button>
			</div>
		</div>
	);
}

function SettingsFieldset({
	settings,
	onSettingChange,
}: {
	settings: CountSettings;
	onSettingChange: (key: keyof CountSettings, value: unknown) => void;
}) {
	return (
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
				{(
					[
						["includeSpaces", "Include Spaces"],
						["includeNewlines", "Include Newlines"],
						["checkHalfKana", "Check Half-width Kana"],
						["excludeHtml", "Exclude HTML"],
						["excludeUrls", "Exclude URLs"],
					] as const
				).map(([key, label]) => (
					<label
						key={key}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "5px",
							cursor: "pointer",
						}}
					>
						<input
							type="checkbox"
							checked={settings[key]}
							onChange={(e) => onSettingChange(key, e.target.checked)}
						/>
						{label}
					</label>
				))}
			</div>
			<SimpleTextRow
				label="Specific String:"
				inputId="specificString"
				type="text"
				value={settings.specificString}
				placeholder="Count occurrences..."
				onChange={(v) => onSettingChange("specificString", v)}
			/>
			<SimpleTextRow
				label="Target Length:"
				inputId="targetLength"
				type="number"
				value={settings.targetLength}
				onChange={(v) => onSettingChange("targetLength", Number(v) || 0)}
			/>
			<SimpleTextRow
				label="Max Length:"
				inputId="maxLength"
				type="number"
				value={settings.maxLength}
				onChange={(v) => onSettingChange("maxLength", Number(v) || 0)}
			/>
		</fieldset>
	);
}

function SimpleTextRow({
	label,
	inputId,
	type,
	value,
	placeholder,
	onChange,
}: {
	label: string;
	inputId: string;
	type: "text" | "number";
	value: string | number;
	placeholder?: string;
	onChange: (v: string) => void;
}) {
	return (
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
			<label htmlFor={inputId}>{label}</label>
			<input
				id={inputId}
				type={type}
				value={value}
				placeholder={placeholder}
				onChange={(e) => onChange(e.target.value)}
				style={{ padding: "2px 4px" }}
			/>
		</div>
	);
}

function ProgressBars({
	stats,
	targetLength,
	maxLength,
}: {
	stats: TextStats;
	targetLength: number;
	maxLength: number;
}) {
	return (
		<fieldset style={{ border: "1px solid #ccc", padding: "15px" }}>
			<legend>Progress</legend>
			<div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
				<ProgressBar
					label="Target"
					current={stats.totalCharacters}
					max={targetLength}
				/>
				<ProgressBar
					label="Max Limit"
					current={stats.totalCharacters}
					max={maxLength}
				/>
			</div>
		</fieldset>
	);
}

function ProgressBar({
	label,
	current,
	max,
}: {
	label: string;
	current: number;
	max: number;
}) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					fontSize: "0.85rem",
				}}
			>
				<span>
					{label}: {current} chars
				</span>
				<span>{max}</span>
			</div>
			<progress
				value={current}
				max={max}
				style={{ width: "100%", height: "15px" }}
			/>
		</div>
	);
}

function BasicStatsTable({ stats }: { stats: TextStats }) {
	const rows: Array<[string, string]> = [
		["Total Characters", String(stats.totalCharacters)],
		["No Spaces", String(stats.charactersWithoutSpaces)],
		["Words", String(stats.wordCount)],
		["Lines", String(stats.lineCount)],
		["Paragraphs", String(stats.paragraphCount)],
		["Sentences", String(stats.sentenceCount)],
		["Byte Size (UTF-8)", `${stats.byteSizeUTF8} B`],
		["400-char Pages", stats.manuscriptPages400.toFixed(1)],
	];
	return (
		<fieldset style={{ border: "1px solid #ccc", padding: "15px" }}>
			<legend>Basic Statistics</legend>
			<StatsTable rows={rows} />
		</fieldset>
	);
}

function CharacterTypesTable({
	stats,
	specificString,
}: {
	stats: TextStats;
	specificString: string;
}) {
	const rows: Array<[string, string]> = [
		["Hiragana", String(stats.characterTypes.hiragana)],
		["Katakana", String(stats.characterTypes.katakana)],
		["Kanji", String(stats.characterTypes.kanji)],
		["Alphanumeric", String(stats.characterTypes.alphanumeric)],
		["Symbols", String(stats.characterTypes.symbols)],
	];
	return (
		<fieldset style={{ border: "1px solid #ccc", padding: "15px" }}>
			<legend>Character Types</legend>
			<StatsTable rows={rows} />
			{specificString && (
				<table
					style={{
						width: "100%",
						borderCollapse: "collapse",
						textAlign: "left",
						fontSize: "0.95rem",
						marginTop: "8px",
					}}
				>
					<tbody>
						<tr
							style={{
								borderBottom: "1px solid #eee",
								backgroundColor: "#f9f9f9",
							}}
						>
							<th
								style={{
									padding: "6px 0",
									fontWeight: "bold",
								}}
							>
								"{specificString}"
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
					</tbody>
				</table>
			)}
		</fieldset>
	);
}

function StatsTable({ rows }: { rows: Array<[string, string]> }) {
	return (
		<table
			style={{
				width: "100%",
				borderCollapse: "collapse",
				textAlign: "left",
				fontSize: "0.95rem",
			}}
		>
			<tbody>
				{rows.map(([label, value]) => (
					<tr key={label} style={{ borderBottom: "1px solid #eee" }}>
						<th style={{ padding: "6px 0", fontWeight: "normal" }}>{label}</th>
						<td style={{ padding: "6px 0", textAlign: "right" }}>{value}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}

const TOKEN_COLORS = ["#ffecb3", "#b3e5fc", "#c8e6c9", "#f8bbd0", "#e1bee7"];

function TokenizerDetails({
	tokenCount,
	tokenBlocks,
	isOpen,
	textLength,
	onToggle,
}: {
	tokenCount: number | null;
	tokenBlocks: TokenBlock[];
	isOpen: boolean;
	textLength: number;
	onToggle: (open: boolean) => void;
}) {
	return (
		<details
			style={{ border: "1px solid #ccc", padding: "10px" }}
			onToggle={(e) => onToggle((e.target as HTMLDetailsElement).open)}
		>
			<summary style={{ cursor: "pointer", fontSize: "0.95rem" }}>
				Tokenizer (o200k_base) -{" "}
				<strong>
					{tokenCount !== null ? tokenCount : "Click to calculate"}
				</strong>{" "}
				Tokens
			</summary>
			<div className="mt-2.5 p-2.5 border border-gray-200 bg-white max-h-[300px] overflow-y-auto text-[0.95rem] whitespace-pre-wrap break-all leading-[1.4]">
				{tokenBlocks.map((block, i) => (
					<span
						key={`${block.id}-${i}`}
						style={{
							backgroundColor: TOKEN_COLORS[i % TOKEN_COLORS.length],
						}}
						title={`Token ID: ${block.id}`}
					>
						{block.str}
					</span>
				))}
				{tokenBlocks.length === 0 && isOpen && textLength > 0 && (
					<span>Loading tokens...</span>
				)}
				{textLength === 0 && <span style={{ color: "#999" }}>[ No Data ]</span>}
			</div>
		</details>
	);
}

export default function TextCounterTool() {
	const [text, setText] = useState("");
	const [settings, setSettings] = useState<CountSettings>(DEFAULT_SETTINGS);
	const [isTokenizerOpen, setIsTokenizerOpen] = useState(false);

	const stats: TextStats = useMemo(
		() => calculateTextStats(text, settings),
		[text, settings],
	);

	const tokenData = useMemo(() => {
		if (!isTokenizerOpen || !text)
			return { count: null as number | null, blocks: [] as TokenBlock[] };
		try {
			const enc = getEncoding("o200k_base");
			const tokens = enc.encode(text);
			const blocks: TokenBlock[] = tokens.map((id, i) => ({
				id: tokens[i],
				str: enc.decode([tokens[i]]),
			}));
			return { count: tokens.length, blocks };
		} catch (e) {
			console.error("Tokenizer error:", e);
			return { count: null, blocks: [] as TokenBlock[] };
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

	const handleSettingChange = useCallback(
		(key: keyof CountSettings, value: unknown) => {
			setSettings((prev) => ({ ...prev, [key]: value }));
		},
		[],
	);

	return (
		<RawDOMContainer
			title="Text Counter"
			breadcrumbs={[
				{ label: "Home", href: "/" },
				{ label: "Tools", href: "/tools" },
				{ label: "Text Counter" },
			]}
		>
			<div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
				<div
					style={{
						flex: "1 1 500px",
						display: "flex",
						flexDirection: "column",
						gap: "15px",
					}}
				>
					<TextInputSection
						text={text}
						onTextChange={handleTextChange}
						onClear={handleClear}
						onCopy={handleCopyText}
					/>
					<SettingsFieldset
						settings={settings}
						onSettingChange={handleSettingChange}
					/>
				</div>
				<div
					style={{
						flex: "1 1 300px",
						display: "flex",
						flexDirection: "column",
						gap: "20px",
					}}
				>
					<ProgressBars
						stats={stats}
						targetLength={settings.targetLength}
						maxLength={settings.maxLength}
					/>
					<BasicStatsTable stats={stats} />
					<CharacterTypesTable
						stats={stats}
						specificString={settings.specificString}
					/>
					<TokenizerDetails
						tokenCount={tokenData.count}
						tokenBlocks={tokenData.blocks}
						isOpen={isTokenizerOpen}
						textLength={text.length}
						onToggle={setIsTokenizerOpen}
					/>
				</div>
			</div>
		</RawDOMContainer>
	);
}
