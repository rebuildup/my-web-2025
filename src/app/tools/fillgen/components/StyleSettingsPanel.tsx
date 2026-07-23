"use client";

import type { Dispatch, SetStateAction } from "react";
import type { StyleSettings } from "./types";
import { presets } from "./presets";

type Props = {
	settings: StyleSettings;
	setSettings: Dispatch<SetStateAction<StyleSettings>>;
};

function ColorField({
	label,
	value,
	ariaLabel,
	onChange,
}: {
	label: string;
	value: string;
	ariaLabel: string;
	onChange: (v: string) => void;
}) {
	return (
		<div>
			<label
				style={{
					display: "block",
					fontSize: 14,
					marginBottom: 4,
				}}
			>
				{label}
			</label>
			<input
				type="color"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				style={{
					width: "100%",
					height: 40,
					border: "1px solid #ddd",
					borderRadius: 4,
				}}
				aria-label={ariaLabel}
			/>
		</div>
	);
}

function RangeField({
	label,
	value,
	min,
	max,
	step,
	ariaLabel,
	onChange,
}: {
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	ariaLabel: string;
	onChange: (v: number) => void;
}) {
	return (
		<div>
			<p style={{ marginBottom: 4 }}>
				{label}: {value}px
			</p>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
				aria-label={ariaLabel}
				style={{ width: "100%" }}
			/>
		</div>
	);
}

export function StyleSettingsPanel({ settings, setSettings }: Props) {
	return (
		<fieldset
			style={{
				border: "1px solid #ccc",
				padding: 16,
				marginTop: 16,
			}}
		>
			<legend>スタイル設定</legend>
			<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						flexWrap: "wrap",
						gap: 8,
					}}
				>
					<h2
						style={{
							fontWeight: 700,
							fontSize: 20,
							margin: 0,
						}}
					>
						スタイル設定
					</h2>
					<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
						<label style={{ fontSize: 14 }}>プリセット:</label>
						<select
							value={
								Object.keys(presets).find(
									(key) =>
										JSON.stringify(presets[key]) === JSON.stringify(settings),
								) ?? "custom"
							}
							onChange={(e) => {
								const presetName = e.target.value;
								if (presetName !== "custom" && presets[presetName]) {
									setSettings(presets[presetName]);
								}
							}}
							style={{
								padding: "4px 8px",
								fontSize: 14,
								minWidth: 140,
							}}
							aria-label="プリセット"
						>
							{Object.keys(presets).map((key) => (
								<option key={key} value={key}>
									{key === "default"
										? "デフォルト"
										: key === "modern"
											? "モダン"
											: key === "warm"
												? "ウォーム"
												: key === "minimal"
													? "ミニマル"
													: key}
								</option>
							))}
							<option value="custom">カスタム</option>
						</select>
					</div>
				</div>

				<hr
					style={{
						border: "none",
						borderTop: "1px solid #eee",
					}}
				/>

				<details open>
					<summary
						style={{
							fontWeight: 600,
							fontSize: 16,
							cursor: "pointer",
							padding: "4px 0",
						}}
					>
						色設定
					</summary>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
							gap: 16,
							marginTop: 12,
						}}
					>
						<ColorField
							label="背景色"
							ariaLabel="背景色"
							value={settings.colors.bgColor}
							onChange={(v) =>
								setSettings({
									...settings,
									colors: { ...settings.colors, bgColor: v },
								})
							}
						/>
						<ColorField
							label="テキスト色"
							ariaLabel="テキスト色"
							value={settings.colors.textColor}
							onChange={(v) =>
								setSettings({
									...settings,
									colors: { ...settings.colors, textColor: v },
								})
							}
						/>
						<ColorField
							label="アクセント色"
							ariaLabel="アクセント色"
							value={settings.colors.accentColor}
							onChange={(v) =>
								setSettings({
									...settings,
									colors: { ...settings.colors, accentColor: v },
								})
							}
						/>
						<ColorField
							label="正解色"
							ariaLabel="正解色"
							value={settings.colors.correctColor}
							onChange={(v) =>
								setSettings({
									...settings,
									colors: { ...settings.colors, correctColor: v },
								})
							}
						/>
						<ColorField
							label="不正解色"
							ariaLabel="不正解色"
							value={settings.colors.incorrectColor}
							onChange={(v) =>
								setSettings({
									...settings,
									colors: { ...settings.colors, incorrectColor: v },
								})
							}
						/>
						<ColorField
							label="ブロック背景色"
							ariaLabel="ブロック背景色"
							value={settings.colors.blockBg}
							onChange={(v) =>
								setSettings({
									...settings,
									colors: { ...settings.colors, blockBg: v },
								})
							}
						/>
					</div>
				</details>

				<details>
					<summary
						style={{
							fontWeight: 600,
							fontSize: 16,
							cursor: "pointer",
							padding: "4px 0",
						}}
					>
						テキストサイズ
					</summary>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 16,
							marginTop: 12,
						}}
					>
						<RangeField
							label="基本サイズ"
							ariaLabel="基本テキストサイズ"
							value={settings.textSize.base}
							min={12}
							max={24}
							step={1}
							onChange={(v) =>
								setSettings({
									...settings,
									textSize: { ...settings.textSize, base: v },
								})
							}
						/>
						<RangeField
							label="タイトルサイズ"
							ariaLabel="タイトルサイズ"
							value={settings.textSize.title}
							min={18}
							max={36}
							step={1}
							onChange={(v) =>
								setSettings({
									...settings,
									textSize: { ...settings.textSize, title: v },
								})
							}
						/>
						<RangeField
							label="見出しサイズ"
							ariaLabel="見出しサイズ"
							value={settings.textSize.header}
							min={14}
							max={28}
							step={1}
							onChange={(v) =>
								setSettings({
									...settings,
									textSize: { ...settings.textSize, header: v },
								})
							}
						/>
						<RangeField
							label="セクションサイズ"
							ariaLabel="セクションサイズ"
							value={settings.textSize.section}
							min={12}
							max={24}
							step={1}
							onChange={(v) =>
								setSettings({
									...settings,
									textSize: { ...settings.textSize, section: v },
								})
							}
						/>
						<RangeField
							label="空欄サイズ"
							ariaLabel="空欄サイズ"
							value={settings.textSize.blank}
							min={12}
							max={24}
							step={1}
							onChange={(v) =>
								setSettings({
									...settings,
									textSize: { ...settings.textSize, blank: v },
								})
							}
						/>
					</div>
				</details>

				<details>
					<summary
						style={{
							fontWeight: 600,
							fontSize: 16,
							cursor: "pointer",
							padding: "4px 0",
						}}
					>
						ボタンスタイル
					</summary>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 16,
							marginTop: 12,
						}}
					>
						<RangeField
							label="角丸"
							ariaLabel="ボタンの角丸"
							value={settings.button.borderRadius}
							min={0}
							max={20}
							step={1}
							onChange={(v) =>
								setSettings({
									...settings,
									button: { ...settings.button, borderRadius: v },
								})
							}
						/>
						<RangeField
							label="フォントサイズ"
							ariaLabel="ボタンのフォントサイズ"
							value={settings.button.fontSize}
							min={10}
							max={20}
							step={1}
							onChange={(v) =>
								setSettings({
									...settings,
									button: { ...settings.button, fontSize: v },
								})
							}
						/>
					</div>
				</details>

				<details>
					<summary
						style={{
							fontWeight: 600,
							fontSize: 16,
							cursor: "pointer",
							padding: "4px 0",
						}}
					>
						空欄スタイル
					</summary>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 16,
							marginTop: 12,
						}}
					>
						<div>
							<label
								style={{
									display: "block",
									fontSize: 14,
									marginBottom: 4,
								}}
							>
								線のスタイル
							</label>
							<select
								value={settings.blank.borderStyle}
								onChange={(e) =>
									setSettings({
										...settings,
										blank: {
											...settings.blank,
											borderStyle: e.target.value as
												| "solid"
												| "dashed"
												| "dotted"
												| "double",
										},
									})
								}
								aria-label="線のスタイル"
								style={{
									width: "100%",
									padding: "4px 8px",
									fontSize: 14,
								}}
							>
								<option value="solid">実線</option>
								<option value="dashed">破線</option>
								<option value="dotted">点線</option>
								<option value="double">二重線</option>
							</select>
						</div>
						<RangeField
							label="線の太さ"
							ariaLabel="空欄の線の太さ"
							value={settings.blank.borderWidth}
							min={1}
							max={5}
							step={1}
							onChange={(v) =>
								setSettings({
									...settings,
									blank: { ...settings.blank, borderWidth: v },
								})
							}
						/>
						<ColorField
							label="背景色"
							ariaLabel="空欄の背景色"
							value={settings.blank.backgroundColor}
							onChange={(v) =>
								setSettings({
									...settings,
									blank: { ...settings.blank, backgroundColor: v },
								})
							}
						/>
					</div>
				</details>

				<details>
					<summary
						style={{
							fontWeight: 600,
							fontSize: 16,
							cursor: "pointer",
							padding: "4px 0",
						}}
					>
						ページ切り替えタブスタイル
					</summary>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 16,
							marginTop: 12,
						}}
					>
						<RangeField
							label="角丸"
							ariaLabel="タブの角丸"
							value={settings.navTab.borderRadius}
							min={0}
							max={30}
							step={1}
							onChange={(v) =>
								setSettings({
									...settings,
									navTab: { ...settings.navTab, borderRadius: v },
								})
							}
						/>
						<RangeField
							label="フォントサイズ"
							ariaLabel="タブのフォントサイズ"
							value={settings.navTab.fontSize}
							min={10}
							max={20}
							step={1}
							onChange={(v) =>
								setSettings({
									...settings,
									navTab: { ...settings.navTab, fontSize: v },
								})
							}
						/>
					</div>
				</details>
			</div>
		</fieldset>
	);
}
